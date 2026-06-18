# Design — Módulo de Usuário, Autenticação e RBAC (backend .NET)

> Data: 2026-06-18 · Branch: `dev` · Status: aprovado para planejamento
>
> Porta a camada de identidade/autorização do Supabase (frontend React) para o backend
> consolidado `Finnance.Api`, seguindo o DDL novo (`docs/DDL.txt`) e o padrão do template
> (Clean Architecture achatada por módulos, Dapper + PostgreSQL, DI por reflexão).

## 1. Objetivo e escopo

Gerar o módulo de **usuário**, **autenticação (login + JWT)** e **RBAC (role + user_role)**,
incluindo CRUD administrativo de usuários, seed de papéis e o pipeline de sessão que liga o
token ao `ApiContextVo` (usuário logado nas queries).

**No escopo:**
- User CRUD + administração (list/create/update/update-password/delete) com guards e mensagens da spec 07.
- Login + emissão/validação de JWT + `GET /api/auth/me`.
- Módulos `Role` e `UserRole` (RBAC completo do DDL) + seed `ADMIN`/`USER`.
- Reativar `GetUserLogged` (hoje stub) para decodificar o JWT e popular o `ApiContextVo` por request.

**Fora do escopo (entregas futuras):**
- Perfil próprio editável (`upsert_profile`), upload de avatar, `audit_log`, refresh token, MFA.

## 2. Decisões (confirmadas com o usuário)

| Tema | Decisão |
|---|---|
| Roles | **RBAC completo** do DDL (`role` + `user_role` N:N), seed `ADMIN`/`USER`. "admin" = papel `ADMIN`. |
| Auth | **JWT próprio** (`JwtHelper`, HMAC-SHA256) + senha **Argon2id** (`Argon2Helper`). Sem bcrypt — banco novo está vazio, não há migração de hash. |
| Mensagens de erro | **pt-BR**. |
| Sessão | Reativar `GetUserLogged` real + popular `ApiContextVo` por request. |
| Validação | Apenas `dotnet build` limpo (sem suíte de testes no projeto). Smoke test no banco fica para depois. |
| PK do usuário | `int8` identity (DDL), **não** UUID (diferente do Supabase). |
| Profile | Colunas `full_name/avatar_url/currency/locale` ficam **na própria tabela `user`** (DDL não tem tabela `profiles` separada). |

## 3. Divergências DDL × Supabase (e como resolvemos)

| Aspecto | Supabase/Frontend hoje | DDL novo (fonte de verdade) | Resolução |
|---|---|---|---|
| PK usuário | `auth.users.id` UUID | `user.user int8` identity | Seguir DDL (`int8`). |
| Roles | flag `profiles.is_admin` | `role` + `user_role` (RBAC) | RBAC; `ADMIN` substitui `is_admin=true`. |
| Profile | tabela `profiles` 1:1 | colunas dentro de `user` | Colunas no `user`. |
| Hash senha | bcrypt `gen_salt('bf')` | `password_hash` (genérico) | Argon2id. |
| Autorização | RLS por `auth.uid()` | — (app-level) | Filtro de tenant na aplicação (entrega futura para as features financeiras; aqui só auth/admin). |

## 4. Estrutura de arquivos

```
Finnance.Api/Modules/User/
  Domain/
    Entities/UserEntity.cs            (+ ValidateCreate/ValidateUpdate)
    Entities/RoleEntity.cs
    Entities/UserRoleEntity.cs
    Interfaces/IUserRepository.cs  IRoleRepository.cs  IUserRoleRepository.cs
  Application/
    Interfaces/IUserService.cs  IAuthService.cs
    Services/UserService/_UserService.cs  UserService.Create.cs  UserService.Admin.cs  ValidatePersistence.cs
    Services/AuthService/_AuthService.cs
    Dto/UserDisplayDto.cs  UserLightDto.cs  UserCreateDto.cs  UserUpdateDto.cs
        UserUpdatePasswordDto.cs  LoginDto.cs  SessionDto.cs  MeDto.cs  RoleDto.cs
  Repository/
    Models/UserMod.cs  RoleMod.cs  UserRoleMod.cs
    Repositories/UserRepository.cs  RoleRepository.cs  UserRoleRepository.cs

Finnance.Api/Controllers/
  AuthController.cs        (POST login [AllowAnonymous]; GET me)
  UserController.cs        (GET list; POST create; PUT update; PUT updatePassword; DELETE delete)

Alterações em arquivos existentes:
  Security/AuthorizationAttribute.cs  → AccessExt.GetUserLogged real (DecodeJwt)
  Configuration/*                     → registrar ApiContextVo por request (a partir do token)
  (seed de roles no bootstrap ou script idempotente)
```

> A DI por reflexão (`DependencyInjectionConfiguration.GetSouls`) descobre serviços/repos
> automaticamente pelo sufixo de namespace (`.Application.Services`, `.Repository.Repositories`).
> O `TypeMapper` mapeia os `*Mod` pelo sufixo `.Repository.Models`. **Nenhum registro manual.**

## 5. Entidades e Models (fiel ao DDL)

`BaseEntity`/`BaseModel` só trazem `Language/Created/Updated`. PK, `active` e demais colunas
são declaradas em cada entidade/model. PK homônima à tabela vira propriedade C# nomeada.

### UserEntity / UserMod (`user`)
Colunas DDL: `user int8` (PK identity), `email text`, `password_hash text`, `full_name text`,
`avatar_url text`, `currency text`, `locale text`, `active bool`, `created`, `updated`.

```csharp
// UserMod
[Table("user")]
public class UserMod : BaseModel
{
    [Key] public long User { get; set; }                       // PK auto-increment (user.user)
    [Column("email")] public string Email { get; set; }
    [Column("password_hash")] public string PasswordHash { get; set; }
    [Column("full_name")] public string FullName { get; set; }
    [Column("avatar_url")] public string AvatarUrl { get; set; }
    [Column("currency")] public string Currency { get; set; }
    [Column("locale")] public string Locale { get; set; }
    [Column("active")] public bool Active { get; set; }
}
```
`UserEntity` espelha as props (nomes coincidentes para o `.MapTo<>()`), **sem `PasswordHash` nos DTOs de leitura**.

### RoleEntity / RoleMod (`role`)
`role int8` (PK), `code text` (UNIQUE), `name text`, `active bool`. Lookup.

### UserRoleEntity / UserRoleMod (`user_role`)
`user_role int8` (PK), `user int8` (FK), `role int8` (FK), `active bool`. UNIQUE `(user, role)`.

> **Defaults na criação** (DDL não define DEFAULT em SQL): `Currency='BRL'`, `Locale='pt-BR'`,
> `Active=true`. Aplicados no Service, não no banco.

## 6. Repositories

Todos herdam `BaseRepository<TEntity, TModel>` (ctor sem parâmetros; contexto via `ServiceLocator`).
SQL inline via `EntityHelper` (gerado) + queries extras com `StringBuilder`/`DynamicParameters`.

- **IUserRepository / UserRepository** — base + `GetByEmail(string email)` (case-insensitive,
  `WHERE LOWER(email)=LOWER(@email) AND active`). Usado em login e checagem de unicidade.
- **IRoleRepository / RoleRepository** — base + `GetByCode(string code)`.
- **IUserRoleRepository / UserRoleRepository** — base + `GetRolesByUser(long user)`
  (join `user_role` × `role`, retorna roles ativos do usuário); `ExistUserRole(user, role)`.

## 7. Services

Partial, injeção por primary constructor, transações via `using var tran = GetTransaction(); ... tran.Complete();`.
Validação 100% imperativa (Entity + `ValidatePersistence.cs`). Erros via `BusinessError`.

### UserService (`IUserService`)
- `Create(UserEntity, roleCode)` — normaliza email (trim+lower), valida obrigatório/único/senha≥6,
  hash Argon2, insere user, vincula `UserRole` (default `USER`).
- `Update(UserEntity)` — atualiza email/full_name/role; revalida unicidade de email.
- `UpdatePassword(long user, string password)` — valida ≥6, regrava hash.
- `Delete(long user, long currentUser)` — guard **não pode deletar a si mesmo**; checa existência.
- `ListManaged()` — lista usuários + flag admin (derivada de `user_role`/`ADMIN`).

### AuthService (`IAuthService`)
- `Login(LoginDto)` — `GetByEmail`; se não achar → `USER_NOT_FOUND`; `Argon2Helper.VerifyPassword`
  falso → `USER_INVALID_PASSWORD`; monta claims (`nameid`=user, `lang`, `utc`), gera JWT
  (`JwtHelper.GeraToken`, expiração configurável), retorna `SessionVo`.
- `Me(long user)` — dados do usuário + roles (via `UserRoleRepository`). Equivale a `get_profile`.

> A chave de assinatura do JWT e a expiração vêm de configuração (`appsettings`/Constants).
> Confirmar a origem exata na fase de plano (há `INVALID_SECRET_KEY` no enum → provavelmente já há convenção).

## 8. Controllers — sempre `ResultApi<T>`

Herdam `Controllers.ControllerBase` (`[Route("api/[controller]/[action]")]`, expõe `UserLogged`).
Sucesso → `new ResultApi<T> { Result = ... }`. Erro → `BusinessError` capturado por `GlobalErrorHandle`.

### AuthController
- `POST /api/auth/login` `[AllowAnonymous]` → `ResultApi<SessionDto>`.
- `GET /api/auth/me` → `ResultApi<MeDto>` (usa `UserLogged.user`).

### UserController (admin)
Decorado com `[Authorization(Constants.AuthObject.USER, Constants.AuthActivity.X)]`.
- `GET /api/user/list` → `ResultApi<List<UserLightDto>>`
- `POST /api/user/create` → `ResultApi<long>`
- `PUT /api/user/update` → `ResultApi<bool>`
- `PUT /api/user/updatePassword` → `ResultApi<bool>`
- `DELETE /api/user/delete` → `ResultApi<bool>` (passa `UserLogged.user` para o guard anti-auto-deleção)

> **Nota sobre autorização admin:** o `AuthorizationAttribute` é stub e não diferencia papel.
> Para garantir o guard "Access denied", o `UserService`/controller admin checa explicitamente se
> `UserLogged.user` tem papel `ADMIN` (via `UserRoleRepository`) — não depende do atributo stub.

## 9. DTOs

| DTO | Campos |
|---|---|
| `LoginDto` | `Email`, `Password` |
| `SessionDto` | `Token`, `User`, `Name`, `Authenticated`, `Idiom` (de `SessionVo`) |
| `MeDto` | `User`, `Email`, `FullName`, `AvatarUrl`, `Currency`, `Locale`, `Roles: List<string>`, `IsAdmin` |
| `UserLightDto` | `User`, `Email`, `FullName`, `IsAdmin`, `Created` |
| `UserDisplayDto` | tudo do Light + `AvatarUrl`, `Currency`, `Locale`, `Active` |
| `UserCreateDto` | `Email`, `Password`, `FullName`, `IsAdmin` |
| `UserUpdateDto` | `User`, `Email`, `FullName`, `IsAdmin` |
| `UserUpdatePasswordDto` | `User`, `Password` |

Nenhum DTO expõe `PasswordHash`. Conversão sempre via `.MapTo<T>()`.

## 10. Mapa de erros (GeneralErrorNumber existentes → pt-BR)

| Situação | GeneralErrorNumber | FieldName | Mensagem pt-BR (mapeada no GlobalErrorHandle) |
|---|---|---|---|
| Email vazio | `REQUIRED_FIELD` | `EMAIL` | "E-mail é obrigatório" |
| Senha vazia | `EMPTY_PASSWORD` | `PASSWORD` | "Senha é obrigatória" |
| Senha < 6 | `NUMBER_MIN_CHARACTERS_PASSWORD` | `PASSWORD` | "A senha deve ter ao menos 6 caracteres" |
| Email já existe | `FIELD_ALREADY_EXISTS` | `EMAIL` | "E-mail já existe" |
| Usuário não encontrado | `USER_NOT_FOUND` | `USER` | "Usuário não encontrado" |
| Senha inválida (login) | `USER_INVALID_PASSWORD` | `PASSWORD` | "E-mail ou senha inválidos" |
| Sem permissão (não-admin) | `ERROR_AUTHORIZATION` | — | "Acesso negado" |
| Auto-deleção | `BusinessError(string)` | — | "Você não pode excluir seu próprio usuário" |

> Verificar na fase de plano se o `GlobalErrorHandle` já tem tabela de mensagens por idioma; se sim,
> adicionar as entradas pt-BR ali; se não, retornar a string diretamente no `Message` do `ResultApi`.

## 11. Pipeline de sessão (alteração em arquivo existente)

Hoje `AccessExt.GetUserLogged` retorna `(0,"","")` (stub), mas `AccessExt.DecodeJwt` já lê os claims.
Plano:
1. `GetUserLogged` passa a: ler o token (`GetToken`), validar (`JwtHelper.ValidateToken`), e em caso
   de sucesso chamar `DecodeJwt` → `(user, language, timeZone)`. Sem token → `(0,"","")` (anônimo).
2. Um ponto de composição por request cria o `ApiContextVo(conn, user, language, timeZone)` com a
   connection string descriptografada (mantendo o `sch=` se houver) e o usuário do token, registrando-o
   no escopo que o `ServiceLocator`/`BaseRepository` consome.

> O mecanismo exato de "ApiContextVo por request" (middleware vs. factory no escopo) será detalhado no
> plano após inspecionar `ApplicationConfiguration.cs` e como o `ApiContextVo` é registrado hoje.

## 12. Seed de papéis

Inserção idempotente de `role` (`ADMIN`, `USER`) — `INSERT ... ON CONFLICT (code) DO NOTHING`
(há UNIQUE em `role.code`). Executado uma vez no bootstrap ou via método de seed chamado no startup.
Forma final confirmada no plano.

## 13. Verificação

- **Gate:** `dotnet build` da pasta `Finnance.Api/` sem erros nem warnings novos.
- A DI por reflexão precisa resolver os novos serviços/repos no `BuildServiceProvider()` do startup —
  se um namespace estiver fora da convenção, o build passa mas a resolução falha em runtime; por isso o
  plano inclui subir a API uma vez (`dotnet run`) e bater num endpoint anônimo para confirmar boot.

## 14. Riscos / pontos a confirmar no plano

1. Origem da **chave JWT** e da **expiração** (Constants/appsettings).
2. Se o `EntityHelper`/`[Table("user")]` lida com a tabela `user` (palavra reservada no Postgres →
   precisa de aspas `"user"`). **Verificar geração de SQL com quoting** — possível ajuste no `EntityHelper`
   ou uso de `[Table("\"user\"")]`. Mesmo cuidado para a coluna/relação `role`.
3. Como o **`ApiContextVo` é instanciado por request** hoje (provavelmente já há um ponto; senão, criar).
4. Tabela de mensagens i18n do `GlobalErrorHandle` (se existe) para encaixar os textos pt-BR.
