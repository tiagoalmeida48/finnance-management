# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`finnance-management` é um app de gestão financeira pessoal (UI em pt-BR). Comunique-se com o usuário em **pt-BR**.

---

## 1. O repositório tem duas metades

```
finnance-management/
├── Finnance.Api/                 # Backend .NET 9 (Web API) — em construção
│   ├── Modules/                  # Features de negócio por domínio (uma pasta por módulo)
│   │   └── Common/               # Módulo base: camadas Domain/Application/Repository reutilizáveis
│   ├── Shared/                   # Cross-cutting: BaseClass, Extensions, Utils (fora dos módulos)
│   ├── Controllers/  Security/  Configuration/
│   ├── wwwroot/                  # Build do frontend é servido daqui (SPA fallback)
│   └── Frontend/                 # SPA React 19 + Supabase — a aplicação que está em produção hoje
│       └── CLAUDE.md             # ← guia COMPLETO do frontend; leia-o ao mexer em Frontend/
├── docs/                         # PRD, arquitetura, specs de migração e schema do banco
├── Finnance.Api.slnx             # Solution (referencia só Finnance.Api.csproj)
└── README.md                     # Descreve o template .NET genérico, NÃO este app (ver §6)
```

**A aplicação real, hoje, é o frontend React em `Finnance.Api/Frontend/`** (React 19 + Supabase: Auth, PostgreSQL, RLS, RPCs, Edge Functions). Para qualquer trabalho ali, o `Finnance.Api/Frontend/CLAUDE.md` é a fonte de verdade — não duplico o conteúdo dele aqui. Comandos de frontend (`pnpm dev/build/lint/check:ci`, sempre **pnpm**) e regras de banco Supabase estão lá.

**O backend `Finnance.Api/` é uma migração em andamento**: substituir o Supabase por uma API .NET Core local. Está em estágio de **scaffolding** — a base arquitetural existe (módulo `Common` + `Shared`), mas nenhuma feature de negócio (transações, contas, cartões…) foi escrita ainda. As regras de negócio a portar estão verificadas contra o banco real em `docs/specs/` (specs 00–10). Consulte-as antes de implementar qualquer algoritmo de domínio (transação→fatura, recálculo de fatura, sync de saldo, folha/salário).

---

## 2. Build e execução do backend

```bash
# da pasta Finnance.Api/
dotnet build                      # compila o projeto único
dotnet run                        # sobe a Web API (Kestrel)
```

- Projeto **único consolidado**: `Finnance.Api.csproj` (não é multi-projeto). `net9.0`, `Nullable=disable`, `LangVersion=13.0`, `ImplicitUsings=enable`.
- **Não há suíte de testes** em nenhuma das metades. O gate do frontend é `pnpm check:ci`; o do backend é compilar (`dotnet build`). Verifique mudanças rodando.
- Banco: **PostgreSQL** (`finnance_dev`) via Npgsql + Dapper. A connection string em `appsettings.json` está **criptografada** e é descriptografada em runtime por `HashHelper.DecryptConnectionString`. Não cole connection string em claro no arquivo.
- O frontend é compilado para `wwwroot/`; o backend serve a SPA com `app.MapFallbackToFile("index.html")`.

---

## 3. Arquitetura do backend — template consolidado num único assembly

O backend segue o padrão **Clean Architecture do template `base-project-api-clean`**, mas **achatado num só projeto** e **organizado por módulos**. O que no template eram projetos separados aqui são pastas:

```
Finnance.Api/
├── Modules/                          # namespace Finnance.Api.Modules.<Feature>.*
│   └── Common/                       # módulo base (Finnance.Api.Modules.Common.*)
│       ├── Domain/        Interfaces/ (IBaseRepository…)  Vo/ (ApiContextVo, SessionVo…)
│       ├── Application/   Interfaces/  Services/BaseService/ (BaseService<T>, BaseRead/Write/CsvExport)
│       └── Repository/    BaseRepository/Base/  BaseRepository/EntityHelper/  (Models/  Repositories/ por feature)
└── Shared/                           # namespace Finnance.Api.Shared.*  (fora dos módulos)
    ├── BaseClass/ (BaseEntity, BaseModel)  Extensions/
    └── Utils/ (ResultApi, JwtHelper, Argon2Helper, HashHelper, Constants…)
```

Cada feature de negócio vira um **módulo próprio** em `Finnance.Api/Modules/<Feature>/` (namespace `Finnance.Api.Modules.<Feature>.{Domain,Application,Repository}`), com suas próprias entidades, models, repos, services e o controller correspondente em `Controllers/`. O módulo **`Common`** guarda as classes base de cada camada (`BaseService`, `BaseRepository`, VOs, interfaces base) — reutilizável; não coloque lógica de negócio nele. **`Shared`** (na raiz, fora de `Modules/`) é cross-cutting puro: utils, extensions e classes base de Entity/Model.

### Injeção de dependência por reflexão
`Configuration/DependencyInjectionConfiguration.cs` (`GetSouls`) registra serviços/repos automaticamente **varrendo o assembly**: casa o prefixo `Finnance.Api.Modules` com o **sufixo da camada** (`.Domain.Services`, `.Application.Services`, `.Repository.Repositories`) e liga `Foo` ↔ `IFoo`. Assim **qualquer módulo novo é descoberto automaticamente** — basta seguir a convenção de namespace por camada; não há registro manual no container. Models do Dapper são mapeados igual, via `TypeMapper.Initialize([".Repository.Models"], [])` (sufixo de camada, varre todos os módulos).

### Dapper + PostgreSQL
- Todo repositório herda `BaseRepository<TEntity, TModel>` e abre conexão com `using var con = Conn;` (propriedade que retorna `new NpgsqlConnection`). Nunca injete `IDbConnection`/`DbContext`.
- A connection string suporta **schema customizado** via prefixo `sch=nome;` (lido no construtor de `BaseRepository`).
- SQL é **inline**: `const string` para queries simples, `StringBuilder` + `DynamicParameters` para dinâmicas. `EntityHelper` gera SELECT/WHERE a partir de atributos do Model. **Nunca arquivos `.sql` separados nem SQL fora dos repositórios.**
- Services herdam `BaseService<T>`; transações via `using var tran = GetTransaction()` (`TransactionScope`) + `tran.Complete()`.

### Estado atual: stubs do template ainda não reimplementados
Vários serviços do template foram **removidos na consolidação** e marcam o lugar com `// Stub: ... sera reimplementado em Finnance.Api/Modules`. Hoje são apenas stubs:
- **Logging** (`GlobalErrorHandle.TryLog`), **rate limiting** por política, **scheduler/attachments** no bootstrap.

A **autorização já está implementada** (não é mais stub): `Security/AuthorizationAttribute` lê o usuário e o claim `is_admin` do JWT (ver §4.6).

Ao implementar um módulo que dependa de algo assim, reimplemente o serviço correspondente — não presuma que já funciona.

---

## 4. Contratos e regras invioláveis do backend

Estas regras vêm do template e o código novo deve segui-las (atualizadas para a estrutura consolidada):

1. **Todo controller REST retorna `ResultApi<T>`** (`{ Success, Message, InternalError, Result }`). Nunca `IActionResult`/`ActionResult<T>`/tipo direto. Sucesso → 200 com `Result`; erro → capturado por `GlobalErrorHandle` (`/errors`).
2. **Erros de negócio lançam `ApplicationException` com constante pt-BR** (`throw new ApplicationException(Constants.ErrorMessage.X)`) — nunca `Exception`/`ArgumentException` genérica nem mensagem literal inline. Não existe `BusinessError`/`GeneralErrorNumber`/`FieldName` (foram removidos). `GlobalErrorHandle` mapeia `ApplicationException` → HTTP 400.
3. **Validação é 100% imperativa** no Domain (`ValidateCreate`/`ValidateUpdate`/`ValidatePersistence` na Entity) e no Service (partial `ValidatePersistence.cs`). **Não use FluentValidation nem DataAnnotations.**
4. **Nunca exponha a Entity na API.** Controllers recebem/retornam DTOs; conversão sempre via `.MapTo<T>()` (extension próprio), nunca propriedade a propriedade.
5. **Models de banco têm sufixo `Mod`** e ficam em `Repository/Models/` do módulo da feature (namespace terminando em `.Repository.Models`). Entity (`...Entity`) nunca vai direto pro Dapper.
6. **Autorização** via `[Authorization(admin: true)]` (somente admin) ou `[Authorization]` (apenas autenticado) — nunca `[Authorize]` padrão. O atributo lê o usuário e o claim `is_admin` do JWT; **não há tabelas `role`/`user_role` nem `IUserRoleService`** — o admin é a coluna booleana `is_admin` na tabela `user`. Sem token → `Constants.ErrorMessage.ErrorAccess`; logado sem ser admin → `ErrorAuthorization`.
7. **Serviços grandes são `partial`** divididos por responsabilidade (`_FooService.cs`, `FooGetService.cs`, `ValidatePersistence.cs`). Arquivos de classe base usam prefixo `_`.

| Artefato | Convenção | Exemplo |
|---|---|---|
| Entidade de domínio | `Entity` | `UserEntity` |
| Model de banco | `Mod` | `UserMod` |
| Repositório | `I…Repository` / `…Repository` | `IUserRepository` / `UserRepository` |
| Serviço | `I…Service` / `…Service` | `IUserService` / `UserService` |
| DTO leitura/criação/update | `DisplayDto`/`LightDto` · `CreateDto` · `UpdateDto` | `UserDisplayDto`, `UserCreateDto` |

---

## 5. Frontend (resumo — detalhe em `Finnance.Api/Frontend/CLAUDE.md`)

React 19 + TypeScript estrito + Vite (rolldown), Tailwind v4, React Query, Zustand, React Router v7, RHF + Zod. Sempre **pnpm** (pinado em `pnpm@10.28.1`). Fluxo de dados unidirecional `pages → shared/hooks/api → shared/services → Supabase`; lógica de negócio mora em **RPCs** Postgres `SECURITY DEFINER` (não reimplementar no cliente). Cada página pareia com um hook `use*PageLogic`. Para qualquer detalhe (design tokens, constraints de migração do banco, Edge Functions Pluggy), abra o CLAUDE.md de lá.

---

## 6. ⚠️ README.md e specs

- O **`README.md` da raiz descreve o template genérico `base-project-api-clean`** (estrutura multi-projeto `ProjectBase.*`, GraphQL/HotChocolate, Hangfire) — **não reflete este app**. O backend real é o assembly único consolidado de §3, **sem GraphQL e sem Hangfire**. Não tome o README como verdade arquitetural deste repositório; este CLAUDE.md prevalece.
- `docs/specs/00–10` são a especificação verificada das regras de negócio (transações, faturas, saldo, folha, dashboard, auth, integrações Pluggy) — a referência canônica ao portar lógica do Supabase para o `Finnance.Api`.

---

## 7. Branches

`main` = produção, `dev` = desenvolvimento ativo (branch atual). O frontend faz deploy na Vercel como SPA.
