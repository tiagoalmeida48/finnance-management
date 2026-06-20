---
name: dotnet-backend-pattern
description: Enforces the finnance-management backend (.NET 9 / Finnance.Api) conventions — module anatomy, Clean Architecture consolidated in one assembly, reflection-based DI, ApplicationException + Constants.ErrorMessage, RBAC by attribute, inline Dapper. Use when creating, refactoring, or reviewing any code under Finnance.Api/ except Finnance.Api/Frontend/ ("novo módulo backend", "criar endpoint .NET", "repositório Dapper", "controller", "portar do Supabase", "regra de negócio backend").
---

# .NET Backend Pattern (Finnance.Api)

Single source of truth for the `Finnance.Api` backend conventions. The backend is a **single consolidated assembly** following Clean Architecture **organized by modules**. This skill is canonical for the .NET agents (`dotnet-module-builder`, `dotnet-code-reviewer`, `spec-to-module-porter`, `dotnet-build-fixer`).

## When to Use

Any work under `Finnance.Api/` — **except** `Finnance.Api/Frontend/` (that is React + Supabase; use the React skills instead). Creating a feature module, an endpoint, a repository, porting a `docs/specs/` business rule, or reviewing backend code.

## Non-Negotiable Contracts

These override default behavior. Code that violates them is wrong, even if it compiles.

1. **Controllers return `ResultApi<T>`** — never `IActionResult`/`ActionResult<T>`/raw type. Success → `new ResultApi<T> { Result = ... }`. Errors are caught by `GlobalErrorHandle` (`/errors`).
2. **Business errors throw `ApplicationException` with a pt-BR constant**: `throw new ApplicationException(Constants.ErrorMessage.UserNotFound)`. There is **no** `BusinessError` class and **no** `GeneralErrorNumber`/`FieldName` enums — they were removed. `GlobalErrorHandle` maps `ApplicationException` → HTTP 400 (uses `.Message`); any other exception → 500 (generic `Constants.ErrorMessage.ErrorNotExpected`).
3. **Error messages are `const string` in `Constants.ErrorMessage`** (nested class in `partial class Constants`, file `Shared/Utils/Constants/ErrorMessage.cs`). Add a new constant there; never inline a literal message in a `throw`.
4. **Validation is 100% imperative** — in the Domain (`ValidateCreate`/`ValidateUpdate`/`ValidatePersistence` on the Entity) and in the Service (partial `ValidatePersistence.cs`). **No FluentValidation, no DataAnnotations.**
5. **Never expose the Entity in the API.** Controllers receive/return DTOs; conversion always via `.MapTo<T>()`, never property-by-property.
6. **DB Models have suffix `Mod`** and live in `Repository/Models/` of the feature module (namespace ending in `.Repository.Models`). The Entity (`...Entity`) never goes straight to Dapper.
7. **Authorization** via `[Authorization(Constants.RoleId.ADMIN)]` (role id from RBAC), not `[Authorize]`. The attribute reads the user from the JWT, resolves `IUserRoleService`, and checks `user_role`.
8. **Large services are `partial`**, split by responsibility (`_FooService.cs`, `FooGetService.cs`, `ValidatePersistence.cs`). Base-class files use the `_` prefix.
9. **Zero comments.** No `//`, `/* */`, or XML doc anywhere. Remove any comment found while editing.
10. **SQL is inline in the repositories** — `const string` for static queries, `StringBuilder` + `DynamicParameters` for dynamic. Never `.sql` files, never SQL outside a repository.

## Naming Conventions

| Artifact | Convention | Example |
|---|---|---|
| Domain entity | `...Entity` | `UserEntity` |
| DB model | `...Mod` | `UserMod` |
| Repository | `I...Repository` / `...Repository` | `IUserRepository` / `UserRepository` |
| Service | `I...Service` / `...Service` | `IUserService` / `UserService` |
| DTO read/create/update | `DisplayDto`/`LightDto` · `CreateDto` · `UpdateDto` | `UserDisplayDto`, `UserCreateDto` |

## Module Anatomy

A feature lives in `Finnance.Api/Modules/<Feature>/`, namespace `Finnance.Api.Modules.<Feature>.{Domain,Application,Repository}`, with its Controller in `Controllers/`:

```
Modules/<Feature>/
├── Domain/
│   ├── Entities/<Feature>Entity.cs        # ...Entity, imperative ValidateCreate/Update/Persistence
│   └── Interfaces/I<Feature>Repository.cs
├── Application/
│   ├── Dto/<Feature>{Create,Update,Display,Light}Dto.cs
│   ├── Interfaces/I<Feature>Service.cs    # : IBaseService<...Entity>
│   └── Services/<Feature>Service/
│       ├── _<Feature>Service.cs           # partial main
│       ├── <Feature>GetService.cs         # partial, reads
│       └── ValidatePersistence.cs         # partial, service-level validation
└── Repository/
    ├── Models/<Feature>Mod.cs             # ...Mod, [Table], [Column], [Key]/[ExplicitKey]
    └── Repositories/<Feature>Repository.cs # : BaseRepository<...Entity, ...Mod>
```

`Common` holds the base classes of each layer (`BaseService`, `BaseRepository`, VOs, base interfaces) — reusable; never put business logic there. `Shared` (at the root, outside `Modules/`) is pure cross-cutting: `Utils` (ResultApi, Constants, JwtHelper, Argon2Helper), `Extensions`, `BaseClass` (BaseEntity, BaseModel).

## Reflection-Based DI

`Configuration/DependencyInjectionConfiguration.cs` (`GetSouls`) registers services/repos automatically by scanning the assembly: it matches the `Finnance.Api.Modules` prefix with the **layer suffix** (`.Domain.Services`, `.Application.Services`, `.Repository.Repositories`) and binds `Foo` ↔ `IFoo`. **A new module is auto-discovered** — just follow the namespace-per-layer convention; there is no manual container registration. Dapper models are mapped the same way via `TypeMapper.Initialize([".Repository.Models"], [])`.

Implication: the interface must be named `I` + class name (`UserService` ↔ `IUserService`) and live in the right layer namespace, or DI won't find it.

## Dapper + PostgreSQL

- Every repository inherits `BaseRepository<TEntity, TMod>` and opens a connection with `using var con = Conn;` (property returning `new NpgsqlConnection`). Never inject `IDbConnection`/`DbContext`.
- Map results back to entities with `MapToEntity(model)` / `MapToEntity(list)`.
- **Reserved Postgres words `user`/`role` must be quoted** in SQL: `WHERE "user" = @user`. Use raw string literals (`"""..."""`) to keep the quotes. The `Mod` quotes them in `[Table("\"user\"")]` / `[Column("\"role\"")]`.
- Connection string supports a custom schema via the `sch=name;` prefix (read in the `BaseRepository` constructor).
- The base `Delete` breaks on quoted names → for `user`/`role` repos write the delete with explicit SQL.

Reference repository (dynamic Search):

```csharp
public List<UserRoleEntity> Search(long user = 0, long role = 0, bool active = false, int quantity = 0)
{
    var sb = new StringBuilder();
    var param = new DynamicParameters();
    sb.Append("SELECT * FROM user_role WHERE 1 = 1 ");
    if (user > 0) { param.Add("user", user); sb.Append("""AND "user" = @user """); }
    if (role > 0) { param.Add("role", role); sb.Append("""AND "role" = @role """); }
    if (active) sb.Append("AND active = TRUE ");
    if (quantity > 0) { param.Add("quantity", quantity); sb.Append("LIMIT @quantity"); }
    using var con = Conn;
    var model = con.Query<UserRoleMod>(sb.ToString(), param).ToList();
    return MapToEntity(model);
}
```

## Error & Authorization Model

- Throw: `throw new ApplicationException(Constants.ErrorMessage.RegisterNotFound);`
- New message: add `public const string X = "...";` to `Constants.ErrorMessage`, in pt-BR with full diacritics.
- RBAC ids/codes are in `Shared/Utils/Constants/Authorization.cs`: `Constants.RoleId` (`ADMIN = 1`, `USER = 2`) and `Constants.RoleCode` (`"admin"`/`"user"`). The DDL has only `role` + `user_role` (no object/activity tables) — RBAC is role-based, not granular.
- Protect an endpoint: `[Authorization(Constants.RoleId.ADMIN)]` on the action. Empty roles = authenticated-only. The attribute throws `ApplicationException(Constants.ErrorMessage.ErrorAuthorization)` on failure.

## Workflow: Add a Feature Module

1. Read the relevant `docs/specs/` (00–10) for the business rule and the DDL (`docs/sql/finnance_dev_schema.sql`) for table/column names and PK type (`int8` identity, not UUID).
2. Create the Entity (`Domain/Entities`) with imperative validation; the Mod (`Repository/Models`) with `[Table]`/`[Column]` (quote reserved names); the repo interface (`Domain/Interfaces`) and repo (`Repository/Repositories`) inheriting `BaseRepository`.
3. Create the service interface (`Application/Interfaces`, `: IBaseService<...Entity>`) and the `partial` service (`Application/Services/<Feature>Service/`).
4. Create DTOs (`Application/Dto`) and the Controller (`Controllers/`) returning `ResultApi<T>`, converting via `.MapTo<T>()`, guarded by `[Authorization(...)]`.
5. Do **not** register anything in DI — reflection handles it once namespaces follow the convention.
6. Gate: `cd Finnance.Api && dotnet build` must be **0 errors, 0 warnings**. There is no test suite.

## Gotchas

- `JwtConstants.SecretKey`/`ExpirationHours` are hard-coded constants (project pattern) — swap for env in production.
- The connection string in `appsettings.json` is **encrypted**; decrypted at runtime by `HashHelper.DecryptConnectionString`. Never paste a plaintext connection string.
- `README.md` describes a generic template (multi-project, GraphQL, Hangfire) — **not** this app. This skill and the project `CLAUDE.md` prevail.
- The frontend build is served from `wwwroot/` with `MapFallbackToFile("index.html")`.
