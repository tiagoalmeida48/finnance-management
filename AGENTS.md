# AGENTS.md

Instruções para **qualquer agente ou ferramenta de IA** trabalhando neste repositório. Este arquivo é a **fonte canônica** das regras: os `CLAUDE.md` apenas importam este conteúdo. **Edite as regras aqui.** Se a sua ferramenta não lê `AGENTS.md` automaticamente, leia este arquivo (e o `AGENTS.md` da pasta em que for trabalhar) antes de qualquer tarefa.

`finnance-management` é um app de gestão financeira pessoal (UI em pt-BR). Comunique-se com o usuário em **pt-BR**.

---

## 1. O repositório tem duas metades

```
finnance-management/
├── Finnance.Api/                 # Backend .NET 9 (Web API)
│   ├── Modules/                  # Features de negócio por domínio (uma pasta por módulo)
│   │   └── Common/               # Módulo base: camadas Domain/Application/Repository reutilizáveis
│   ├── Shared/                   # Cross-cutting: BaseClass, Extensions, Utils (fora dos módulos)
│   ├── Controllers/  Security/  Configuration/
│   ├── wwwroot/                  # Build do frontend é servido daqui (SPA fallback)
│   └── Frontend/                 # SPA React 19 sobre a API .NET — a aplicação em produção hoje
│       └── AGENTS.md             # ← guia COMPLETO do frontend; leia-o ao mexer em Frontend/
├── docs/
│   └── ...                       # PRD, sql/ (schema + backend_rules)
├── Finnance.Api.slnx             # Solution (referencia só Finnance.Api.csproj)
└── README.md                     # Descreve o template .NET genérico, NÃO este app (ver §6)
```

**A aplicação real, hoje, é o frontend React em `Finnance.Api/Frontend/`**, sobre a **API .NET** local (axios + Bearer/sessionStorage; folder-by-type `features/<feat>/`). O `Finnance.Api/Frontend/AGENTS.md` é a fonte de verdade — não duplico aqui. Comandos (`pnpm dev/build/lint/check:ci`, sempre **pnpm**) estão lá. A migração do frontend legado (React + Supabase, antigo `docs/Referencia/`) foi **concluída** e o legado foi removido do repositório (2026-07-10); só **Pluggy/Open Finance** não foi portado (decisão de produto).

**O backend `Finnance.Api/` substitui o Supabase por uma API .NET Core local** e já saiu do scaffolding: além de `Common`/`Shared`, há módulos de negócio reais em `Modules/` (`User`/auth, `BankAccount`, `Category`/`CategoryType`, `Transaction`/`TransactionType`, `CreditCard`, `CreditCardInvoice`, `CreditCardStatementCycle`, `PaymentMethod`, `AccountType`, `InvoiceStatus`, `InstallmentGroup`, `RecurringGroup`, `SettingsSalary`, `Dashboard`, `Notification`, `Subscription` (Kiwify), `SystemConfig`, `AuditLog`/`AuditAction`…), expostos no Swagger. As regras de negócio de domínio (transação→fatura, recálculo de fatura, sync de saldo, recorrência, folha/salário) já foram portadas e vivem no código (`Modules/`). O contrato consolidado do que o backend deve garantir está em `docs/sql/finnance_dev_backend_rules.md`.

---

## 2. Build e execução do backend

```bash
# da pasta Finnance.Api/
dotnet build                      # compila o projeto único
dotnet run                        # sobe a Web API (Kestrel)
```

- Projeto **único consolidado**: `Finnance.Api.csproj` (não é multi-projeto). `net9.0`, `Nullable=disable`, `LangVersion=13.0`, `ImplicitUsings=enable`.
- **Não há suíte de testes** em nenhuma das metades. O gate do frontend é `pnpm check:ci`; o do backend é compilar (`dotnet build`). Verifique mudanças rodando.
- Banco: **PostgreSQL** (`finnance_dev`) via Npgsql + Dapper. A connection string em `appsettings.json` usa **AES-GCM** e é descriptografada em runtime por `HashHelper.DecryptConnectionString`; a chave Base64 de 32 bytes vem de `ConnectionStrings__EncryptionKey` e nunca é versionada. Não cole connection string nem chave em claro no arquivo.
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

Estas regras vêm do template e o código novo deve segui-las (atualizadas para a estrutura consolidada). O detalhamento completo, com exemplos de código, está em `.claude/skills/dotnet-backend-pattern/SKILL.md` — leia-o antes de mexer no backend.

1. **Todo controller REST retorna `ResultApi<T>`** (`{ Success, Message, InternalError, Result }`). Nunca `IActionResult`/`ActionResult<T>`/tipo direto. Sucesso → 200 com `Result`; erro → capturado por `GlobalErrorHandle` (`/errors`).
2. **Erros de negócio lançam `ApplicationException` com constante pt-BR** (`throw new ApplicationException(Constants.ErrorMessage.X)`) — nunca `Exception`/`ArgumentException` genérica nem mensagem literal inline. Não existe `BusinessError`/`GeneralErrorNumber`/`FieldName` (foram removidos). `GlobalErrorHandle` mapeia `ApplicationException` → HTTP 400.
3. **Validação é 100% imperativa** no Domain (`ValidateCreate`/`ValidateUpdate`/`ValidatePersistence` na Entity) e no Service (partial `ValidatePersistence.cs`). **Não use FluentValidation nem DataAnnotations.**
4. **Nunca exponha a Entity na API.** Controllers recebem/retornam DTOs; conversão sempre via `.MapTo<T>()` (extension próprio), nunca propriedade a propriedade.
5. **Models de banco têm sufixo `Mod`** e ficam em `Repository/Models/` do módulo da feature (namespace terminando em `.Repository.Models`). Entity (`...Entity`) nunca vai direto pro Dapper.
6. **Autorização** via `[Authorization(admin: true)]` (somente admin) ou `[Authorization]` (apenas autenticado) — nunca `[Authorize]` padrão. O atributo lê o usuário e o claim `is_admin` do JWT; **não há tabelas `role`/`user_role` nem `IUserRoleService`** — o admin é a coluna booleana `is_admin` na tabela `user`. Sem token → `Constants.ErrorMessage.ErrorAccess`; logado sem ser admin → `ErrorAuthorization`.
7. **Serviços grandes são `partial`** divididos por responsabilidade (`_FooService.cs`, `FooGetService.cs`, `ValidatePersistence.cs`). Arquivos de classe base usam prefixo `_`.
8. **Zero comentários** no código (`//`, `/* */`, XML doc). Remova comentários ao editar.

| Artefato | Convenção | Exemplo |
|---|---|---|
| Entidade de domínio | `Entity` | `UserEntity` |
| Model de banco | `Mod` | `UserMod` |
| Repositório | `I…Repository` / `…Repository` | `IUserRepository` / `UserRepository` |
| Serviço | `I…Service` / `…Service` | `IUserService` / `UserService` |
| DTO leitura/criação/update | `DisplayDto`/`LightDto` · `CreateDto` · `UpdateDto` | `UserDisplayDto`, `UserCreateDto` |

---

## 5. Frontend (resumo — detalhe em `Finnance.Api/Frontend/AGENTS.md`)

React 19 + TypeScript estrito + Vite, Tailwind v4, React Query, Zustand, React Router v7, RHF + Zod. Sempre **pnpm** (pinado em `pnpm@10.28.1`). Fluxo de dados unidirecional `pages → features/<feat>/hooks (React Query) → features/<feat>/services → apiClient → API .NET`. Cada página pareia com um hook `use*PageLogic`; zero comentários; máx. 300 linhas/arquivo; strings pt-BR inline (sem i18n). Para qualquer detalhe (estrutura `features/`, auth Bearer, rotas, componentes compartilhados), abra o AGENTS.md de lá.

---

## 6. ⚠️ README.md e contrato de regras

- O **`README.md` da raiz descreve o template genérico `base-project-api-clean`** (estrutura multi-projeto `ProjectBase.*`, GraphQL/HotChocolate, Hangfire) — **não reflete este app**. O backend real é o assembly único consolidado de §3, **sem GraphQL e sem Hangfire**. Não tome o README como verdade arquitetural deste repositório; este AGENTS.md prevalece.
- As `docs/specs/00–10` (referência verificada da migração Supabase→.NET) foram **removidas após implementação/validação**; as regras de negócio vivem no código (`Modules/`) e o contrato consolidado em `docs/sql/finnance_dev_backend_rules.md`. O schema completo está em `docs/sql/finnance_dev_schema.sql` (regenerado do banco em 2026-07-10; inclui Subscription/Kiwify e os hardenings de segurança — as migrações datadas foram aplicadas e removidas). Histórico das specs no git. Import CSV já foi portado; **Pluggy continua não portado**.

---

## 7. Branches

`main` = produção, `dev` = desenvolvimento ativo. Em produção na VPS, o frontend é buildado para `Finnance.Api/wwwroot/` e servido diretamente pelo backend .NET/Kestrel como SPA, sem Vercel ou reverse proxy.

---

## 8. Playbooks e papéis (portáveis entre ferramentas)

Os diretórios `.claude/skills/` e `.claude/agents/` contêm **documentos markdown auto-suficientes**. No Claude Code eles são invocados automaticamente como skills/subagentes; em qualquer outra ferramenta, **leia o arquivo indicado e siga-o como instrução** antes da tarefa correspondente.

### Padrões (leia antes de editar a área correspondente)

| Área | Documento |
|---|---|
| Backend `Finnance.Api/` (exceto `Frontend/`) | `.claude/skills/dotnet-backend-pattern/SKILL.md` |
| Frontend — features/páginas React | `.claude/skills/react-feature-pattern/SKILL.md` |
| Clean code do repositório (300 linhas, sem comentários, duplicação) | `.claude/skills/project-clean-code-enforcer/SKILL.md` |
| Performance (profiling, gargalos) | `.claude/skills/code-performance-optimizer/SKILL.md` |

### Papéis (roteiros de tarefa; use como prompt/modo na sua ferramenta)

| Tarefa | Roteiro |
|---|---|
| Criar módulo backend completo (Entity→Mod→Repo→Service→DTO→Controller) | `.claude/agents/dotnet-module-builder.md` |
| Auditar/revisar código backend contra os contratos | `.claude/agents/dotnet-code-reviewer.md` |
| Levar `dotnet build` a 0 erros / 0 warnings | `.claude/agents/dotnet-build-fixer.md` |
| Portar regra de negócio (Supabase→.NET) | `.claude/agents/spec-to-module-porter.md` |
