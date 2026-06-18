# Módulo de Usuário, Autenticação e RBAC — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Portar a camada de usuário, autenticação (login + JWT) e RBAC do Supabase para o backend `Finnance.Api` consolidado, seguindo o DDL novo.

**Architecture:** Módulos `User`/`Role`/`UserRole` em `Finnance.Api/Modules/User/` (Domain/Application/Repository), descobertos pela DI por reflexão. Login emite JWT (HMAC-SHA256 via `JwtHelper`); senha com Argon2id (`Argon2Helper`). Controllers retornam `ResultApi<T>`; erros via `BusinessError` traduzidos para pt-BR no choke-point `_GlobalErrorHandle`. A factory de `ApiContextVo` por request (já existente) é endurecida para validar a assinatura do token.

**Tech Stack:** .NET 9, Dapper + Npgsql (PostgreSQL), Dapper.Contrib attributes, Konscious Argon2, System.IdentityModel.Tokens.Jwt.

## Global Constraints

- `net9.0`, `Nullable=disable`, `LangVersion=13.0`, `ImplicitUsings=enable`. Projeto único `Finnance.Api.csproj`.
- **Sem suíte de testes.** O gate de cada tarefa é `dotnet build` limpo (0 erros, 0 warnings novos). A tarefa final faz smoke test com `dotnet run`.
- Comando de build (sempre da pasta `Finnance.Api/`): `dotnet build`.
- Todo controller retorna `ResultApi<T>` — nunca `IActionResult`/tipo direto. Sucesso → `new ResultApi<T> { Result = ... }`.
- Erros de negócio: `throw new BusinessError(GeneralErrorNumber.X, FieldName.Y)` — nunca `Exception` genérica (exceto a mensagem custom de auto-deleção, que usa `BusinessError(string)`).
- Entity (`*Entity`) nunca vai ao Dapper; Model (`*Mod`) nunca é exposto na API. Conversão sempre via `.MapTo<T>()`.
- Models de banco têm sufixo `Mod`, ficam em namespace terminando em `.Repository.Models`. Repos em `.Repository.Repositories`. Services em `.Application.Services`. (A DI por reflexão depende disso — namespace errado compila mas falha em runtime.)
- Repositórios herdam `BaseRepository<TEntity,TModel>` (ctor sem parâmetros; contexto via `ServiceLocator`). Conexão via `using var con = Conn;`. SQL inline (`const string` ou `StringBuilder`+`DynamicParameters`) — nunca `.sql` externo.
- Services grandes são `partial` divididos por responsabilidade; arquivos de classe base usam prefixo `_`.
- **Tabelas `user`/`role` são palavras reservadas no PostgreSQL** → usar `[Table("\"user\"")]` e `[Table("\"role\"")]` (o `EntityHelper` injeta o nome cru). **O `Delete` base do `BaseRepository` quebra com nomes quotados** (faz `Split('.')` e bate em `information_schema`) → repositórios dessas tabelas implementam delete com SQL próprio, sem chamar `base.Delete`.
- Defaults na criação (DDL não tem DEFAULT em SQL): `Currency='BRL'`, `Locale='pt-BR'`, `Active=true`, `Created=Updated=DateTime.Now` (o `BaseRepository.Create` já seta Created/Updated).
- Mensagens de erro em **pt-BR**.

---

## File Structure

```
Finnance.Api/Modules/User/
  Domain/
    Entities/UserEntity.cs
    Entities/RoleEntity.cs
    Entities/UserRoleEntity.cs
    Interfaces/IUserRepository.cs
    Interfaces/IRoleRepository.cs
    Interfaces/IUserRoleRepository.cs
  Application/
    Interfaces/IUserService.cs
    Interfaces/IAuthService.cs
    Dto/LoginDto.cs  SessionDto.cs  MeDto.cs  RoleDto.cs
        UserLightDto.cs  UserDisplayDto.cs  UserCreateDto.cs  UserUpdateDto.cs  UserUpdatePasswordDto.cs
    Services/UserService/_UserService.cs
    Services/UserService/UserService.Admin.cs
    Services/UserService/ValidatePersistence.cs
    Services/AuthService/_AuthService.cs
  Repository/
    Models/UserMod.cs  RoleMod.cs  UserRoleMod.cs
    Repositories/UserRepository.cs  RoleRepository.cs  UserRoleRepository.cs

Finnance.Api/Controllers/
  AuthController.cs
  UserController.cs

Finnance.Api/Shared/Utils/
  JwtConstants.cs                         (NOVO — key + expiração)
  ErrorMessages.cs                        (NOVO — dicionário pt-BR + extension TranslatedMessage)

Modificados:
  Security/AuthorizationAttribute.cs      (DecodeJwt valida assinatura; GetUserLogged liga ao token)
  Configuration/_Configuration.cs:85      (factory valida token antes de decodificar)
  Controllers/_GlobalErrorHandle.cs:72    (Message = errTrat.TranslatedMessage())
  Finnance.Api.csproj OU bootstrap        (seed de roles idempotente)
```

---

### Task 1: Constantes de JWT

**Files:**
- Create: `Finnance.Api/Shared/Utils/JwtConstants.cs`

**Interfaces:**
- Produces: `JwtConstants.SecretKey` (string), `JwtConstants.ExpirationHours` (int).

- [ ] **Step 1: Criar o arquivo de constantes**

```csharp
namespace Finnance.Api.Shared.Utils;

public static class JwtConstants
{
    // Chave de assinatura HMAC-SHA256. Segue o padrao do projeto (constante local,
    // como HashHelper.KeyConnectionString). Trocar por valor de ambiente em producao.
    public const string SecretKey = "Fmg9rT2xQ7vK1pLs8dWzC4hN6bY0aJ3uE5oG7iR9kM2nP4qS6tU8wX1zB3dF5gH";
    public const int ExpirationHours = 8;
}
```

- [ ] **Step 2: Build**

Run (da pasta `Finnance.Api/`): `dotnet build`
Expected: `Compilação com êxito. 0 Erro(s)`

- [ ] **Step 3: Commit**

```bash
git add Finnance.Api/Shared/Utils/JwtConstants.cs
git commit -m "feat(auth): adiciona constantes de assinatura/expiracao do JWT"
```

---

### Task 2: Models de banco (UserMod, RoleMod, UserRoleMod)

**Files:**
- Create: `Finnance.Api/Modules/User/Repository/Models/UserMod.cs`
- Create: `Finnance.Api/Modules/User/Repository/Models/RoleMod.cs`
- Create: `Finnance.Api/Modules/User/Repository/Models/UserRoleMod.cs`

**Interfaces:**
- Consumes: `BaseModel` (props `Language/Created/Updated`), `ColumnAttribute` custom (de `BaseModel.cs`), `[Table]`/`[Key]` de Dapper.Contrib.
- Produces: `UserMod { long User; string Email; string PasswordHash; string FullName; string AvatarUrl; string Currency; string Locale; bool Active; }`, `RoleMod { long Role; string Code; string Name; bool Active; }`, `UserRoleMod { long UserRole; long User; long Role; bool Active; }`.

- [ ] **Step 1: UserMod**

```csharp
using Dapper.Contrib.Extensions;
using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.User.Repository.Models;

[Table("\"user\"")]
public class UserMod : BaseModel
{
    [Key] public long User { get; set; }
    [Column("email")] public string Email { get; set; }
    [Column("password_hash")] public string PasswordHash { get; set; }
    [Column("full_name")] public string FullName { get; set; }
    [Column("avatar_url")] public string AvatarUrl { get; set; }
    [Column("currency")] public string Currency { get; set; }
    [Column("locale")] public string Locale { get; set; }
    [Column("active")] public bool Active { get; set; }
}
```

> Nota: confirme o `using` do `ColumnAttribute` custom — ele está declarado em `BaseModel.cs` no namespace de `BaseModel` (`Finnance.Api.Shared.BaseClass`). Se o build acusar ambiguidade com `System.ComponentModel.DataAnnotations.Schema.ColumnAttribute`/`TableAttribute`, qualifique: use o `[Table]`/`[Key]` de `Dapper.Contrib.Extensions` e o `[Column]` de `Finnance.Api.Shared.BaseClass`. Ajuste os `using` conforme o namespace real (verifique abrindo `BaseModel.cs`).

- [ ] **Step 2: RoleMod**

```csharp
using Dapper.Contrib.Extensions;
using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.User.Repository.Models;

[Table("\"role\"")]
public class RoleMod : BaseModel
{
    [Key] public long Role { get; set; }
    [Column("code")] public string Code { get; set; }
    [Column("name")] public string Name { get; set; }
    [Column("active")] public bool Active { get; set; }
}
```

- [ ] **Step 3: UserRoleMod**

```csharp
using Dapper.Contrib.Extensions;
using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.User.Repository.Models;

[Table("user_role")]
public class UserRoleMod : BaseModel
{
    [Key] public long UserRole { get; set; }
    [Column("\"user\"")] public long User { get; set; }
    [Column("\"role\"")] public long Role { get; set; }
    [Column("active")] public bool Active { get; set; }
}
```

> `user_role` não é reservada → tabela sem aspas. Mas as COLUNAS `user` e `role` são reservadas → quotadas via `[Column("\"user\"")]`.

- [ ] **Step 4: Build**

Run: `dotnet build`
Expected: `0 Erro(s)`. Se houver ambiguidade de atributo, resolver os `using` (ver nota no Step 1).

- [ ] **Step 5: Commit**

```bash
git add Finnance.Api/Modules/User/Repository/Models/
git commit -m "feat(user): models Dapper de user, role e user_role"
```

---

### Task 3: Entidades de domínio

**Files:**
- Create: `Finnance.Api/Modules/User/Domain/Entities/UserEntity.cs`
- Create: `Finnance.Api/Modules/User/Domain/Entities/RoleEntity.cs`
- Create: `Finnance.Api/Modules/User/Domain/Entities/UserRoleEntity.cs`

**Interfaces:**
- Consumes: `BaseEntity` (props `Language/Created/Updated`, virtuals `ValidateCreate`/`ValidateUpdate`).
- Produces: `UserEntity` (mesmas props de `UserMod` + `ValidateCreate`/`ValidateUpdate` imperativos), `RoleEntity`, `UserRoleEntity`. Nomes de prop idênticos aos Mods (exigência do `.MapTo<>()` por nome).

- [ ] **Step 1: UserEntity**

```csharp
using Finnance.Api.Shared.BaseClass;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.User.Domain.Entities;

public class UserEntity : BaseEntity
{
    public long User { get; set; }
    public string Email { get; set; }
    public string PasswordHash { get; set; }
    public string FullName { get; set; }
    public string AvatarUrl { get; set; }
    public string Currency { get; set; }
    public string Locale { get; set; }
    public bool Active { get; set; }

    public override void ValidateCreate()
    {
        if (Email.IsEmpty())
            throw new BusinessError(GeneralErrorNumber.REQUIRED_FIELD, FieldName.EMAIL);
    }

    public override void ValidateUpdate()
    {
        if (User <= 0)
            throw new BusinessError(GeneralErrorNumber.REQUIRED_FIELD, FieldName.USER);
        if (Email.IsEmpty())
            throw new BusinessError(GeneralErrorNumber.REQUIRED_FIELD, FieldName.EMAIL);
    }
}
```

> `IsEmpty()` é o helper de string do projeto (usado em `JwtHelper`/`AccessExt`). Confirme o namespace (provável `Finnance.Api.Shared.Extensions`); ajuste o `using` se o build reclamar.

- [ ] **Step 2: RoleEntity**

```csharp
using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.User.Domain.Entities;

public class RoleEntity : BaseEntity
{
    public long Role { get; set; }
    public string Code { get; set; }
    public string Name { get; set; }
    public bool Active { get; set; }
}
```

- [ ] **Step 3: UserRoleEntity**

```csharp
using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.User.Domain.Entities;

public class UserRoleEntity : BaseEntity
{
    public long UserRole { get; set; }
    public long User { get; set; }
    public long Role { get; set; }
    public bool Active { get; set; }
}
```

- [ ] **Step 4: Build + Commit**

Run: `dotnet build` → `0 Erro(s)`
```bash
git add Finnance.Api/Modules/User/Domain/Entities/
git commit -m "feat(user): entidades de dominio user, role e user_role"
```

---

### Task 4: Interfaces e Repositórios

**Files:**
- Create: `Finnance.Api/Modules/User/Domain/Interfaces/IUserRepository.cs`
- Create: `Finnance.Api/Modules/User/Domain/Interfaces/IRoleRepository.cs`
- Create: `Finnance.Api/Modules/User/Domain/Interfaces/IUserRoleRepository.cs`
- Create: `Finnance.Api/Modules/User/Repository/Repositories/UserRepository.cs`
- Create: `Finnance.Api/Modules/User/Repository/Repositories/RoleRepository.cs`
- Create: `Finnance.Api/Modules/User/Repository/Repositories/UserRoleRepository.cs`

**Interfaces:**
- Consumes: `BaseRepository<TEntity,TModel>` (métodos `Create`/`Update`/`GetByKey`/`All`; propriedade protegida `Conn`; `Schema`), `IBaseRepository<T>`.
- Produces:
  - `IUserRepository : IBaseRepository<UserEntity>` + `UserEntity GetByEmail(string email)`, `bool ExistEmail(string email, long ignoreUser)`, `bool UpdatePassword(long user, string passwordHash)`, `bool DeleteUser(long user)`.
  - `IRoleRepository : IBaseRepository<RoleEntity>` + `RoleEntity GetByCode(string code)`.
  - `IUserRoleRepository : IBaseRepository<UserRoleEntity>` + `IEnumerable<string> GetRoleCodesByUser(long user)`, `bool ExistUserRole(long user, long role)`, `bool DeleteByUser(long user)`.

> Por que delete custom: o `BaseRepository.Delete` chama `GetReference` que faz `Split('.')` na tabela e compara contra `information_schema` — quebra com `"user"` quotado. Por isso `DeleteUser`/`DeleteByUser` usam SQL próprio.

- [ ] **Step 1: Interfaces**

`IUserRepository.cs`:
```csharp
using Finnance.Api.Modules.Common.Domain.Interfaces;
using Finnance.Api.Modules.User.Domain.Entities;

namespace Finnance.Api.Modules.User.Domain.Interfaces;

public interface IUserRepository : IBaseRepository<UserEntity>
{
    UserEntity GetByEmail(string email);
    bool ExistEmail(string email, long ignoreUser);
    bool UpdatePassword(long user, string passwordHash);
    bool DeleteUser(long user);
}
```

`IRoleRepository.cs`:
```csharp
using Finnance.Api.Modules.Common.Domain.Interfaces;
using Finnance.Api.Modules.User.Domain.Entities;

namespace Finnance.Api.Modules.User.Domain.Interfaces;

public interface IRoleRepository : IBaseRepository<RoleEntity>
{
    RoleEntity GetByCode(string code);
}
```

`IUserRoleRepository.cs`:
```csharp
using Finnance.Api.Modules.Common.Domain.Interfaces;
using Finnance.Api.Modules.User.Domain.Entities;

namespace Finnance.Api.Modules.User.Domain.Interfaces;

public interface IUserRoleRepository : IBaseRepository<UserRoleEntity>
{
    IEnumerable<string> GetRoleCodesByUser(long user);
    bool ExistUserRole(long user, long role);
    bool DeleteByUser(long user);
}
```

- [ ] **Step 2: UserRepository**

```csharp
using Dapper;
using Finnance.Api.Modules.Common.Repository.BaseRepository.Base;
using Finnance.Api.Modules.User.Domain.Entities;
using Finnance.Api.Modules.User.Domain.Interfaces;
using Finnance.Api.Modules.User.Repository.Models;

namespace Finnance.Api.Modules.User.Repository.Repositories;

public class UserRepository : BaseRepository<UserEntity, UserMod>, IUserRepository
{
    public UserEntity GetByEmail(string email)
    {
        const string sql = "SELECT * FROM \"user\" WHERE LOWER(email) = LOWER(@email) AND active LIMIT 1";
        using var con = Conn;
        var model = con.QueryFirstOrDefault<UserMod>(sql, new { email });
        return MapToEntity(model);
    }

    public bool ExistEmail(string email, long ignoreUser)
    {
        const string sql = "SELECT COUNT(1) FROM \"user\" WHERE LOWER(email) = LOWER(@email) AND \"user\" <> @ignoreUser";
        using var con = Conn;
        return con.ExecuteScalar<long>(sql, new { email, ignoreUser }) > 0;
    }

    public bool UpdatePassword(long user, string passwordHash)
    {
        const string sql = "UPDATE \"user\" SET password_hash = @passwordHash, updated = @now WHERE \"user\" = @user";
        using var con = Conn;
        return con.Execute(sql, new { user, passwordHash, now = DateTime.Now }) > 0;
    }

    public bool DeleteUser(long user)
    {
        const string sql = "DELETE FROM \"user\" WHERE \"user\" = @user";
        using var con = Conn;
        return con.Execute(sql, new { user }) > 0;
    }
}
```

> `MapToEntity`/`Conn` são protegidos do `BaseRepository`. Confirme o namespace exato de `BaseRepository<,>` abrindo `Base/_BaseRepository.cs` e ajuste o `using` (o esqueleto acima assume `...BaseRepository.Base`).

- [ ] **Step 3: RoleRepository**

```csharp
using Dapper;
using Finnance.Api.Modules.Common.Repository.BaseRepository.Base;
using Finnance.Api.Modules.User.Domain.Entities;
using Finnance.Api.Modules.User.Domain.Interfaces;
using Finnance.Api.Modules.User.Repository.Models;

namespace Finnance.Api.Modules.User.Repository.Repositories;

public class RoleRepository : BaseRepository<RoleEntity, RoleMod>, IRoleRepository
{
    public RoleEntity GetByCode(string code)
    {
        const string sql = "SELECT * FROM \"role\" WHERE code = @code AND active LIMIT 1";
        using var con = Conn;
        var model = con.QueryFirstOrDefault<RoleMod>(sql, new { code });
        return MapToEntity(model);
    }
}
```

- [ ] **Step 4: UserRoleRepository**

```csharp
using Dapper;
using Finnance.Api.Modules.Common.Repository.BaseRepository.Base;
using Finnance.Api.Modules.User.Domain.Entities;
using Finnance.Api.Modules.User.Domain.Interfaces;
using Finnance.Api.Modules.User.Repository.Models;

namespace Finnance.Api.Modules.User.Repository.Repositories;

public class UserRoleRepository : BaseRepository<UserRoleEntity, UserRoleMod>, IUserRoleRepository
{
    public IEnumerable<string> GetRoleCodesByUser(long user)
    {
        const string sql = @"SELECT r.code FROM user_role ur
                             JOIN ""role"" r ON r.""role"" = ur.""role""
                             WHERE ur.""user"" = @user AND ur.active AND r.active";
        using var con = Conn;
        return con.Query<string>(sql, new { user });
    }

    public bool ExistUserRole(long user, long role)
    {
        const string sql = "SELECT COUNT(1) FROM user_role WHERE \"user\" = @user AND \"role\" = @role";
        using var con = Conn;
        return con.ExecuteScalar<long>(sql, new { user, role }) > 0;
    }

    public bool DeleteByUser(long user)
    {
        const string sql = "DELETE FROM user_role WHERE \"user\" = @user";
        using var con = Conn;
        return con.Execute(sql, new { user }) > 0;
    }
}
```

- [ ] **Step 5: Build + Commit**

Run: `dotnet build` → `0 Erro(s)`
```bash
git add Finnance.Api/Modules/User/Domain/Interfaces/ Finnance.Api/Modules/User/Repository/Repositories/
git commit -m "feat(user): interfaces e repositorios de user, role e user_role"
```

---

### Task 5: DTOs

**Files:**
- Create: `Finnance.Api/Modules/User/Application/Dto/LoginDto.cs`
- Create: `Finnance.Api/Modules/User/Application/Dto/SessionDto.cs`
- Create: `Finnance.Api/Modules/User/Application/Dto/MeDto.cs`
- Create: `Finnance.Api/Modules/User/Application/Dto/UserLightDto.cs`
- Create: `Finnance.Api/Modules/User/Application/Dto/UserDisplayDto.cs`
- Create: `Finnance.Api/Modules/User/Application/Dto/UserCreateDto.cs`
- Create: `Finnance.Api/Modules/User/Application/Dto/UserUpdateDto.cs`
- Create: `Finnance.Api/Modules/User/Application/Dto/UserUpdatePasswordDto.cs`

**Interfaces:**
- Produces: `LoginDto { string Email; string Password; }`, `SessionDto { string Token; long User; string Name; bool Authenticated; string Idiom; }`, `MeDto { long User; string Email; string FullName; string AvatarUrl; string Currency; string Locale; List<string> Roles; bool IsAdmin; }`, `UserLightDto { long User; string Email; string FullName; bool IsAdmin; DateTime Created; }`, `UserDisplayDto` (Light + `AvatarUrl/Currency/Locale/Active`), `UserCreateDto { string Email; string Password; string FullName; bool IsAdmin; }`, `UserUpdateDto { long User; string Email; string FullName; bool IsAdmin; }`, `UserUpdatePasswordDto { long User; string Password; }`.

- [ ] **Step 1: Criar todos os DTOs** (um arquivo cada, namespace `Finnance.Api.Modules.User.Application.Dto`)

```csharp
namespace Finnance.Api.Modules.User.Application.Dto;

public class LoginDto { public string Email { get; set; } public string Password { get; set; } }

public class SessionDto
{
    public string Token { get; set; }
    public long User { get; set; }
    public string Name { get; set; }
    public bool Authenticated { get; set; }
    public string Idiom { get; set; }
}

public class MeDto
{
    public long User { get; set; }
    public string Email { get; set; }
    public string FullName { get; set; }
    public string AvatarUrl { get; set; }
    public string Currency { get; set; }
    public string Locale { get; set; }
    public List<string> Roles { get; set; } = new();
    public bool IsAdmin { get; set; }
}

public class UserLightDto
{
    public long User { get; set; }
    public string Email { get; set; }
    public string FullName { get; set; }
    public bool IsAdmin { get; set; }
    public DateTime Created { get; set; }
}

public class UserDisplayDto : UserLightDto
{
    public string AvatarUrl { get; set; }
    public string Currency { get; set; }
    public string Locale { get; set; }
    public bool Active { get; set; }
}

public class UserCreateDto
{
    public string Email { get; set; }
    public string Password { get; set; }
    public string FullName { get; set; }
    public bool IsAdmin { get; set; }
}

public class UserUpdateDto
{
    public long User { get; set; }
    public string Email { get; set; }
    public string FullName { get; set; }
    public bool IsAdmin { get; set; }
}

public class UserUpdatePasswordDto { public long User { get; set; } public string Password { get; set; } }
```

> Pode ser um arquivo por classe (preferível, ≤300 linhas é trivial aqui) ou agrupado. Mantenha um arquivo por DTO conforme a File Structure.

- [ ] **Step 2: Build + Commit**

Run: `dotnet build` → `0 Erro(s)`
```bash
git add Finnance.Api/Modules/User/Application/Dto/
git commit -m "feat(user): DTOs de usuario, sessao e perfil"
```

---

### Task 6: Constantes de papéis + mensagens pt-BR

**Files:**
- Create: `Finnance.Api/Shared/Utils/ErrorMessages.cs`
- Modify: `Finnance.Api/Shared/Utils/Constants/Authentication.cs` (adicionar códigos de role)
- Modify: `Finnance.Api/Controllers/_GlobalErrorHandle.cs:72`

**Interfaces:**
- Consumes: `BusinessError` (`ErrorNumber`, `MsgParam`, `Message`), `GeneralErrorNumber`.
- Produces: `Constants.RoleCode.ADMIN` / `Constants.RoleCode.USER` (strings); `ErrorMessages.Translate(BusinessError)` → string pt-BR; extension `TranslatedMessage(this BusinessError)`.

- [ ] **Step 1: Adicionar códigos de role em Constants**

Abrir `Finnance.Api/Shared/Utils/Constants/Authentication.cs`, localizar a classe `Constants` (ou a partial com `AuthObject`/`AuthActivity`) e adicionar a classe aninhada:

```csharp
public static class RoleCode
{
    public const string ADMIN = "ADMIN";
    public const string USER = "USER";
}
```

> Verifique a forma real do `Constants` (é `static partial class` com classes aninhadas `AuthObject`/`AuthActivity`). Encaixe `RoleCode` no mesmo padrão/arquivo.

- [ ] **Step 2: Criar o tradutor de mensagens**

```csharp
namespace Finnance.Api.Shared.Utils;

public static class ErrorMessages
{
    private static readonly Dictionary<GeneralErrorNumber, string> PtBr = new()
    {
        [GeneralErrorNumber.REQUIRED_FIELD] = "Campo obrigatório não informado.",
        [GeneralErrorNumber.EMPTY_PASSWORD] = "Senha é obrigatória.",
        [GeneralErrorNumber.NUMBER_MIN_CHARACTERS_PASSWORD] = "A senha deve ter ao menos 6 caracteres.",
        [GeneralErrorNumber.FIELD_ALREADY_EXISTS] = "E-mail já existe.",
        [GeneralErrorNumber.USER_NOT_FOUND] = "Usuário não encontrado.",
        [GeneralErrorNumber.USER_INVALID_PASSWORD] = "E-mail ou senha inválidos.",
        [GeneralErrorNumber.ERROR_AUTHORIZATION] = "Acesso negado.",
        [GeneralErrorNumber.ERROR_ACCESS] = "Acesso negado.",
        [GeneralErrorNumber.EXPIRED_TOKEN] = "Sessão expirada. Faça login novamente.",
    };

    public static string TranslatedMessage(this BusinessError err)
    {
        // Mensagem custom (BusinessError(string)) tem ErrorNumber == NONE e Message proprio.
        if (err.ErrorNumber == GeneralErrorNumber.NONE && !string.IsNullOrEmpty(err.Message))
            return err.Message;

        return PtBr.TryGetValue(err.ErrorNumber, out var msg) ? msg : err.Message;
    }
}
```

- [ ] **Step 3: Ligar no choke-point do GlobalErrorHandle**

Em `Finnance.Api/Controllers/_GlobalErrorHandle.cs`, na linha 72, trocar:
```csharp
Message = errTrat.Message,
```
por:
```csharp
Message = errTrat.TranslatedMessage(),
```
Adicionar `using Finnance.Api.Shared.Utils;` se ainda não estiver no topo (já está — `BusinessError`/`ResultApi` vêm de lá).

- [ ] **Step 4: Build + Commit**

Run: `dotnet build` → `0 Erro(s)`
```bash
git add Finnance.Api/Shared/Utils/ErrorMessages.cs Finnance.Api/Shared/Utils/Constants/ Finnance.Api/Controllers/_GlobalErrorHandle.cs
git commit -m "feat(auth): codigos de role e traducao pt-BR das mensagens de erro"
```

---

### Task 7: AuthService (login + me)

**Files:**
- Create: `Finnance.Api/Modules/User/Application/Interfaces/IAuthService.cs`
- Create: `Finnance.Api/Modules/User/Application/Services/AuthService/_AuthService.cs`

**Interfaces:**
- Consumes: `IUserRepository.GetByEmail`, `IUserRoleRepository.GetRoleCodesByUser`, `Argon2Helper.VerifyPassword`, `JwtHelper.GeraToken`, `JwtConstants.SecretKey/ExpirationHours`, claims `JwtHelper.NameIdentifier/ClaimLang/ClaimTimeZone`, `SessionVo`, `Constants.RoleCode.ADMIN`, `Constants.LanguageDefault`/`TimeZoneDefault`.
- Produces: `IAuthService { SessionVo Login(string email, string password); MeDto Me(long user); }`.

- [ ] **Step 1: Interface**

```csharp
using Finnance.Api.Modules.Common.Domain.Vo;
using Finnance.Api.Modules.User.Application.Dto;

namespace Finnance.Api.Modules.User.Application.Interfaces;

public interface IAuthService
{
    SessionVo Login(string email, string password);
    MeDto Me(long user);
}
```

- [ ] **Step 2: Implementação**

```csharp
using System.Security.Claims;
using Finnance.Api.Modules.Common.Domain.Vo;
using Finnance.Api.Modules.User.Application.Dto;
using Finnance.Api.Modules.User.Application.Interfaces;
using Finnance.Api.Modules.User.Domain.Interfaces;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.User.Application.Services;

public class AuthService(IUserRepository userRepository, IUserRoleRepository userRoleRepository) : IAuthService
{
    public SessionVo Login(string email, string password)
    {
        var user = userRepository.GetByEmail(email ?? string.Empty);
        if (user == null)
            throw new BusinessError(GeneralErrorNumber.USER_NOT_FOUND, FieldName.EMAIL);

        if (!Argon2Helper.VerifyPassword(password ?? string.Empty, user.PasswordHash ?? string.Empty))
            throw new BusinessError(GeneralErrorNumber.USER_INVALID_PASSWORD, FieldName.PASSWORD);

        var language = user.Locale.IsEmpty() ? Constants.LanguageDefault : user.Locale;
        var claims = new List<Claim>
        {
            new(JwtHelper.NameIdentifier, user.User.ToString()),
            new(JwtHelper.ClaimLang, language),
            new(JwtHelper.ClaimTimeZone, Constants.TimeZoneDefault),
        };

        var token = JwtHelper.GeraToken(claims, DateTime.UtcNow.AddHours(JwtConstants.ExpirationHours), JwtConstants.SecretKey);

        return new SessionVo
        {
            Authenticated = true,
            Login = user.Email,
            User = user.User,
            Name = user.FullName,
            Token = token,
            Idiom = language,
            Platform = JwtHelper.ClaimPlatform,
            RequireMfa = false
        };
    }

    public MeDto Me(long user)
    {
        var entity = userRepository.GetByKey(new Domain.Entities.UserEntity { User = user });
        if (entity == null)
            throw new BusinessError(GeneralErrorNumber.USER_NOT_FOUND, FieldName.USER);

        var roles = userRoleRepository.GetRoleCodesByUser(user).ToList();
        return new MeDto
        {
            User = entity.User,
            Email = entity.Email,
            FullName = entity.FullName,
            AvatarUrl = entity.AvatarUrl,
            Currency = entity.Currency,
            Locale = entity.Locale,
            Roles = roles,
            IsAdmin = roles.Contains(Constants.RoleCode.ADMIN)
        };
    }
}
```

> `GetByKey` é do `BaseRepository` e recebe a entidade com a PK preenchida. Confirme a assinatura (`GetByKey(TEntity key)`) abrindo `Base/ReadCommands.cs`; se filtrar pela PK montada via `EntityHelper`, garanta que a `UserEntity` tem só `User` setado. Se o `GetByKey` gerar SQL que quebra com `"user"` quotado (mesmo risco do `GetReference`), substituir por um `GetById(long)` custom no `UserRepository` com `SELECT * FROM "user" WHERE "user" = @user`. **Verificar no Step 3.**

- [ ] **Step 3: Build + verificar GetByKey**

Run: `dotnet build` → `0 Erro(s)`.
Abrir `Base/ReadCommands.cs` e confirmar como `GetByKey` monta o SQL. Se usar `EntityHelper.GetTableName` (que injeta `"user"` cru) num `SELECT ... WHERE pk = @pk`, funciona. Se passar pela rota de `GetReference`/`Split('.')`, trocar por `GetById` custom no `UserRepository` (e adicionar à interface). Registrar a decisão no commit.

- [ ] **Step 4: Commit**

```bash
git add Finnance.Api/Modules/User/Application/Interfaces/IAuthService.cs Finnance.Api/Modules/User/Application/Services/AuthService/
git commit -m "feat(auth): AuthService com login JWT e endpoint me"
```

---

### Task 8: UserService (CRUD admin)

**Files:**
- Create: `Finnance.Api/Modules/User/Application/Interfaces/IUserService.cs`
- Create: `Finnance.Api/Modules/User/Application/Services/UserService/_UserService.cs`
- Create: `Finnance.Api/Modules/User/Application/Services/UserService/UserService.Admin.cs`
- Create: `Finnance.Api/Modules/User/Application/Services/UserService/ValidatePersistence.cs`

**Interfaces:**
- Consumes: `BaseService<UserEntity>(IUserRepository)`, `IUserRepository` (`GetByEmail`/`ExistEmail`/`UpdatePassword`/`DeleteUser`/`Create`/`Update`/`GetByKey`), `IRoleRepository.GetByCode`, `IUserRoleRepository` (`ExistUserRole`/`DeleteByUser`/`Create`/`GetRoleCodesByUser`), `Argon2Helper.GenerateHashPassword`, `Constants.RoleCode`.
- Produces: `IUserService { long CreateUser(UserEntity entity, string rawPassword, bool isAdmin); bool UpdateUser(UserEntity entity, bool isAdmin); bool UpdateUserPassword(long user, string rawPassword); bool DeleteUser(long user, long currentUser); List<UserLightDto> ListManaged(); void EnsureAdmin(long currentUser); }`.

- [ ] **Step 1: Interface**

```csharp
using Finnance.Api.Modules.Common.Application.Interfaces;
using Finnance.Api.Modules.User.Application.Dto;
using Finnance.Api.Modules.User.Domain.Entities;

namespace Finnance.Api.Modules.User.Application.Interfaces;

public interface IUserService : IBaseService<UserEntity>
{
    long CreateUser(UserEntity entity, string rawPassword, bool isAdmin);
    bool UpdateUser(UserEntity entity, bool isAdmin);
    bool UpdateUserPassword(long user, string rawPassword);
    bool DeleteUser(long user, long currentUser);
    List<UserLightDto> ListManaged();
    void EnsureAdmin(long currentUser);
}
```

> Confirme o namespace de `IBaseService<T>` (`Finnance.Api.Modules.Common.Application.Interfaces`) abrindo `Application/Interfaces/_IBaseService.cs`.

- [ ] **Step 2: Classe base do service (`_UserService.cs`)**

```csharp
using Finnance.Api.Modules.Common.Application.Services.BaseService;
using Finnance.Api.Modules.User.Application.Interfaces;
using Finnance.Api.Modules.User.Domain.Entities;
using Finnance.Api.Modules.User.Domain.Interfaces;

namespace Finnance.Api.Modules.User.Application.Services;

public partial class UserService(
    IUserRepository userRepository,
    IRoleRepository roleRepository,
    IUserRoleRepository userRoleRepository)
    : BaseService<UserEntity>(userRepository), IUserService
{
    private readonly IUserRepository _userRepository = userRepository;
    private readonly IRoleRepository _roleRepository = roleRepository;
    private readonly IUserRoleRepository _userRoleRepository = userRoleRepository;
}
```

> Confirme o namespace de `BaseService<T>` (`...Application.Services.BaseService`) abrindo `_BaseService.cs`. O service partial é UM tipo `UserService` espalhado em 3 arquivos — namespace `...Application.Services` para a DI por reflexão registrar `UserService`↔`IUserService`.

- [ ] **Step 3: Validações (`ValidatePersistence.cs`)**

```csharp
using Finnance.Api.Modules.User.Domain.Entities;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.User.Application.Services;

public partial class UserService
{
    private const int MinPasswordLength = 6;

    private void ValidateEmailUnique(string email, long ignoreUser)
    {
        if (email.IsEmpty())
            throw new BusinessError(GeneralErrorNumber.REQUIRED_FIELD, FieldName.EMAIL);
        if (_userRepository.ExistEmail(email, ignoreUser))
            throw new BusinessError(GeneralErrorNumber.FIELD_ALREADY_EXISTS, FieldName.EMAIL);
    }

    private static void ValidatePassword(string rawPassword)
    {
        if (rawPassword.IsEmpty())
            throw new BusinessError(GeneralErrorNumber.EMPTY_PASSWORD, FieldName.PASSWORD);
        if (rawPassword.Length < MinPasswordLength)
            throw new BusinessError(GeneralErrorNumber.NUMBER_MIN_CHARACTERS_PASSWORD, FieldName.PASSWORD);
    }

    private static string Normalize(string email) => (email ?? string.Empty).Trim().ToLowerInvariant();
}
```

- [ ] **Step 4: Operações admin (`UserService.Admin.cs`)**

```csharp
using Finnance.Api.Modules.User.Application.Dto;
using Finnance.Api.Modules.User.Domain.Entities;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.User.Application.Services;

public partial class UserService
{
    public void EnsureAdmin(long currentUser)
    {
        var roles = _userRoleRepository.GetRoleCodesByUser(currentUser);
        if (!roles.Contains(Constants.RoleCode.ADMIN))
            throw new BusinessError(GeneralErrorNumber.ERROR_AUTHORIZATION);
    }

    public long CreateUser(UserEntity entity, string rawPassword, bool isAdmin)
    {
        entity.Email = Normalize(entity.Email);
        entity.ValidateCreate();
        ValidateEmailUnique(entity.Email, 0);
        ValidatePassword(rawPassword);

        entity.PasswordHash = Argon2Helper.GenerateHashPassword(rawPassword);
        entity.Currency = entity.Currency.IsEmpty() ? "BRL" : entity.Currency;
        entity.Locale = entity.Locale.IsEmpty() ? "pt-BR" : entity.Locale;
        entity.Active = true;

        using var tran = GetTransaction();
        var userId = _userRepository.Create(entity);
        AssignRole(userId, isAdmin ? Constants.RoleCode.ADMIN : Constants.RoleCode.USER);
        tran.Complete();
        return userId;
    }

    public bool UpdateUser(UserEntity entity, bool isAdmin)
    {
        entity.Email = Normalize(entity.Email);
        entity.ValidateUpdate();
        ValidateEmailUnique(entity.Email, entity.User);

        var current = _userRepository.GetByKey(new UserEntity { User = entity.User });
        if (current == null)
            throw new BusinessError(GeneralErrorNumber.USER_NOT_FOUND, FieldName.USER);

        current.Email = entity.Email;
        current.FullName = entity.FullName;

        using var tran = GetTransaction();
        var ok = _userRepository.Update(current);
        SyncAdminRole(entity.User, isAdmin);
        tran.Complete();
        return ok;
    }

    public bool UpdateUserPassword(long user, string rawPassword)
    {
        ValidatePassword(rawPassword);
        var current = _userRepository.GetByKey(new UserEntity { User = user });
        if (current == null)
            throw new BusinessError(GeneralErrorNumber.USER_NOT_FOUND, FieldName.USER);

        var hash = Argon2Helper.GenerateHashPassword(rawPassword);
        using var tran = GetTransaction();
        var ok = _userRepository.UpdatePassword(user, hash);
        tran.Complete();
        return ok;
    }

    public bool DeleteUser(long user, long currentUser)
    {
        if (user == currentUser)
            throw new BusinessError("Você não pode excluir seu próprio usuário.");

        var current = _userRepository.GetByKey(new UserEntity { User = user });
        if (current == null)
            throw new BusinessError(GeneralErrorNumber.USER_NOT_FOUND, FieldName.USER);

        using var tran = GetTransaction();
        _userRoleRepository.DeleteByUser(user);
        var ok = _userRepository.DeleteUser(user);
        tran.Complete();
        return ok;
    }

    public List<UserLightDto> ListManaged()
    {
        var users = _userRepository.All().ToList();
        return users.Select(u => new UserLightDto
        {
            User = u.User,
            Email = u.Email,
            FullName = u.FullName,
            Created = u.Created,
            IsAdmin = _userRoleRepository.GetRoleCodesByUser(u.User).Contains(Constants.RoleCode.ADMIN)
        }).ToList();
    }

    private void AssignRole(long user, string roleCode)
    {
        var role = _roleRepository.GetByCode(roleCode);
        if (role == null) return;
        if (_userRoleRepository.ExistUserRole(user, role.Role)) return;
        _userRoleRepository.Create(new UserRoleEntity { User = user, Role = role.Role, Active = true });
    }

    private void SyncAdminRole(long user, bool isAdmin)
    {
        var admin = _roleRepository.GetByCode(Constants.RoleCode.ADMIN);
        if (admin == null) return;
        var has = _userRoleRepository.ExistUserRole(user, admin.Role);
        if (isAdmin && !has)
            _userRoleRepository.Create(new UserRoleEntity { User = user, Role = admin.Role, Active = true });
        // Remocao de admin fica fora do escopo desta entrega (sem delete granular de user_role).
    }
}
```

> `ListManaged` faz N+1 (uma query de roles por usuário). Aceitável para o volume atual (poucos usuários). Se virar problema, otimizar com um JOIN único depois — não agora (YAGNI).

- [ ] **Step 5: Build + Commit**

Run: `dotnet build` → `0 Erro(s)`
```bash
git add Finnance.Api/Modules/User/Application/Interfaces/IUserService.cs Finnance.Api/Modules/User/Application/Services/UserService/
git commit -m "feat(user): UserService com CRUD admin, hash Argon2 e guards"
```

---

### Task 9: Controllers (Auth + User)

**Files:**
- Create: `Finnance.Api/Controllers/AuthController.cs`
- Create: `Finnance.Api/Controllers/UserController.cs`

**Interfaces:**
- Consumes: `ControllerBase` (`UserLogged.user`), `IAuthService`, `IUserService`, DTOs, `.MapTo<T>()`, `[Authorization(...)]`, `[AllowAnonymous]`, `ResultApi<T>`, `SessionVo`.
- Produces: endpoints REST.

- [ ] **Step 1: AuthController**

```csharp
using Microsoft.AspNetCore.Authorization;
using Finnance.Api.Modules.User.Application.Dto;
using Finnance.Api.Modules.User.Application.Interfaces;
using Finnance.Api.Shared.Extensions;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Controllers;

public class AuthController(IAuthService authService) : ControllerBase
{
    [AllowAnonymous]
    [HttpPost]
    public ResultApi<SessionDto> Login([FromBody] LoginDto dto)
    {
        var session = authService.Login(dto?.Email, dto?.Password);
        return new ResultApi<SessionDto> { Result = session.MapTo<SessionDto>() };
    }

    [HttpGet]
    public ResultApi<MeDto> Me()
    {
        var me = authService.Me(UserLogged.user);
        return new ResultApi<MeDto> { Result = me };
    }
}
```

> Confirme o namespace do `.MapTo<>()` (`SerializerExt` em `Shared/Extensions`) e do `ResultApi`/`Constants` (`Shared/Utils`). Ajuste os `using`. `[HttpPost]`/`[HttpGet]` vêm de `Microsoft.AspNetCore.Mvc` (já disponível via `ControllerBase`). A rota é `api/auth/login` e `api/auth/me` (convenção `[Route("api/[controller]/[action]")]` herdada).

- [ ] **Step 2: UserController**

```csharp
using Finnance.Api.Modules.User.Application.Dto;
using Finnance.Api.Modules.User.Application.Interfaces;
using Finnance.Api.Modules.User.Domain.Entities;
using Finnance.Api.Security;
using Finnance.Api.Shared.Extensions;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Controllers;

public class UserController(IUserService userService) : ControllerBase
{
    [Authorization(Constants.AuthObject.USER, Constants.AuthActivity.READ)]
    [HttpGet]
    public ResultApi<List<UserLightDto>> List()
    {
        userService.EnsureAdmin(UserLogged.user);
        return new ResultApi<List<UserLightDto>> { Result = userService.ListManaged() };
    }

    [Authorization(Constants.AuthObject.USER, Constants.AuthActivity.CREATE)]
    [HttpPost]
    public ResultApi<long> Create([FromBody] UserCreateDto dto)
    {
        userService.EnsureAdmin(UserLogged.user);
        var entity = new UserEntity { Email = dto.Email, FullName = dto.FullName };
        var id = userService.CreateUser(entity, dto.Password, dto.IsAdmin);
        return new ResultApi<long> { Result = id };
    }

    [Authorization(Constants.AuthObject.USER, Constants.AuthActivity.UPDATE)]
    [HttpPut]
    public ResultApi<bool> Update([FromBody] UserUpdateDto dto)
    {
        userService.EnsureAdmin(UserLogged.user);
        var entity = new UserEntity { User = dto.User, Email = dto.Email, FullName = dto.FullName };
        return new ResultApi<bool> { Result = userService.UpdateUser(entity, dto.IsAdmin) };
    }

    [Authorization(Constants.AuthObject.USER, Constants.AuthActivity.UPDATE)]
    [HttpPut]
    public ResultApi<bool> UpdatePassword([FromBody] UserUpdatePasswordDto dto)
    {
        userService.EnsureAdmin(UserLogged.user);
        return new ResultApi<bool> { Result = userService.UpdateUserPassword(dto.User, dto.Password) };
    }

    [Authorization(Constants.AuthObject.USER, Constants.AuthActivity.DELETE)]
    [HttpDelete]
    public ResultApi<bool> Delete([FromBody] long user)
    {
        userService.EnsureAdmin(UserLogged.user);
        return new ResultApi<bool> { Result = userService.DeleteUser(user, UserLogged.user) };
    }
}
```

> Confirme que `Constants.AuthObject.USER` e `Constants.AuthActivity.{READ,CREATE,UPDATE,DELETE}` existem (vistos na investigação). `[FromBody] long user` no Delete: se o frontend mandar via query/route, ajustar o binding — confirmar contrato com o front depois (não bloqueia o build).

- [ ] **Step 3: Build + Commit**

Run: `dotnet build` → `0 Erro(s)`
```bash
git add Finnance.Api/Controllers/AuthController.cs Finnance.Api/Controllers/UserController.cs
git commit -m "feat(api): controllers de auth (login/me) e user (CRUD admin)"
```

---

### Task 10: Endurecer a sessão (validar assinatura do JWT)

**Files:**
- Modify: `Finnance.Api/Security/AuthorizationAttribute.cs` (`DecodeJwt` valida assinatura; `GetUserLogged` liga ao token)
- Modify: `Finnance.Api/Configuration/_Configuration.cs:85` (já usa `DecodeJwt`; passa a validar)

**Interfaces:**
- Consumes: `JwtHelper.ValidateToken(token, key)`, `JwtConstants.SecretKey`, `JwtHelper.NameIdentifier/ClaimLang/ClaimTimeZone`.
- Produces: `GetUserLogged` real; `DecodeJwt` validado.

- [ ] **Step 1: Validar assinatura no DecodeJwt**

Em `Security/AuthorizationAttribute.cs`, no método `DecodeJwt` (linhas 46-56), trocar o `ReadJwtToken` cru por validação real. Versão final:

```csharp
public static (long user, string language, string timeZone) DecodeJwt(this HttpContext ctx, string token)
{
    // Valida assinatura/expiracao antes de extrair claims.
    var principal = JwtHelper.ValidateToken(token, JwtConstants.SecretKey);

    var userClaim = long.Parse(principal.FindFirst(JwtHelper.NameIdentifier)?.Value ?? "0");
    var langClaim = principal.FindFirst(JwtHelper.ClaimLang)?.Value ?? string.Empty;
    var timeZoneClaim = principal.FindFirst(JwtHelper.ClaimTimeZone)?.Value ?? string.Empty;

    return (userClaim, langClaim, timeZoneClaim);
}
```

> `JwtHelper.ValidateToken` retorna `ClaimsPrincipal` e já lança `BusinessError(EXPIRED_TOKEN/ERROR_ACCESS)` em token inválido. Como a factory de `ApiContextVo` (`_Configuration.cs:82-83`) só chama `DecodeJwt` quando há token, um token inválido agora resulta em erro 401/403 — comportamento correto. Adicionar `using Finnance.Api.Shared.Utils;` se necessário (já há `using Finnance.Api.Shared.Utils;` no arquivo).

- [ ] **Step 2: Ligar GetUserLogged ao token**

No mesmo arquivo, `GetUserLogged` (linhas 39-44) hoje retorna stub. Versão final:

```csharp
public static (long user, string language, string timeZone) GetUserLogged(this HttpContext ctx)
{
    var (_, token) = ctx.GetToken();
    if (token.IsEmpty()) return (0L, string.Empty, string.Empty);
    return ctx.DecodeJwt(token);
}
```

> Isso faz `ControllerBase.UserLogged` (usado nos controllers e no `GlobalErrorHandle`) refletir o usuário real do token. Em rotas `[AllowAnonymous]` sem token, retorna `(0,"","")`.

- [ ] **Step 3: Build**

Run: `dotnet build` → `0 Erro(s)`

- [ ] **Step 4: Commit**

```bash
git add Finnance.Api/Security/AuthorizationAttribute.cs
git commit -m "feat(auth): valida assinatura do JWT e liga GetUserLogged ao token"
```

---

### Task 11: Seed idempotente de papéis

**Files:**
- Create: `Finnance.Api/Modules/User/Repository/RoleSeed.cs`
- Modify: `Finnance.Api/Configuration/ApplicationConfiguration.cs` (chamar o seed no startup)

**Interfaces:**
- Consumes: connection string descriptografada (mesma usada na factory), Npgsql/Dapper.
- Produces: `RoleSeed.Run(string connectionString)` — insere `ADMIN`/`USER` em `role` com `ON CONFLICT (code) DO NOTHING`.

- [ ] **Step 1: Criar o seed**

```csharp
using Dapper;
using Npgsql;

namespace Finnance.Api.Modules.User.Repository;

public static class RoleSeed
{
    public static void Run(string connectionString)
    {
        const string sql = @"
            INSERT INTO ""role"" (code, name, active, created, updated) VALUES
                ('ADMIN', 'Administrador', true, now(), now()),
                ('USER',  'Usuário',       true, now(), now())
            ON CONFLICT (code) DO NOTHING;";
        using var con = new NpgsqlConnection(connectionString);
        con.Execute(sql);
    }
}
```

- [ ] **Step 2: Chamar no startup**

Abrir `Finnance.Api/Configuration/ApplicationConfiguration.cs`, localizar o método `ApplicationConfiguration(this WebApplication app, IConfiguration configuration)` e, após o pipeline estar montado (perto do fim, antes do `return`/fim do método), adicionar:

```csharp
var connSeed = Shared.Utils.HashHelper.DecryptConnectionString(configuration.GetConnectionString("DefaultConnection"));
try { Modules.User.Repository.RoleSeed.Run(connSeed); }
catch { /* banco pode nao estar acessivel em dev; nao derruba o boot */ }
```

> Confirme a assinatura real de `ApplicationConfiguration` abrindo o arquivo. O `try/catch` evita que a ausência do banco (ex.: Tailscale offline) impeça o boot — o seed roda quando o banco estiver acessível. Se preferir falhar alto, remover o catch.

- [ ] **Step 3: Build**

Run: `dotnet build` → `0 Erro(s)`

- [ ] **Step 4: Commit**

```bash
git add Finnance.Api/Modules/User/Repository/RoleSeed.cs Finnance.Api/Configuration/ApplicationConfiguration.cs
git commit -m "feat(user): seed idempotente dos papeis ADMIN e USER no startup"
```

---

### Task 12: Smoke test de boot + resolução de DI

**Files:** nenhum (validação).

- [ ] **Step 1: Subir a API**

Run (da pasta `Finnance.Api/`, em background ou outro terminal): `dotnet run`
Expected: Kestrel sobe sem exceção. Em particular, **o `BuildServiceProvider()` resolve os novos serviços** — se um namespace estiver fora da convenção da DI por reflexão, o boot lança. Boot limpo = DI ok.

- [ ] **Step 2: Bater no Swagger / endpoint anônimo**

Run: `curl -s http://localhost:<porta>/swagger/index.html -o /dev/null -w "%{http_code}"` (ou abrir o Swagger no navegador).
Expected: 200. Confirmar que `AuthController.Login`, `AuthController.Me`, `UserController.*` aparecem no Swagger.

- [ ] **Step 3: (Opcional, se banco acessível) Testar login**

Pré-requisito: DDL aplicado em `finnance_dev` + ao menos 1 usuário inserido com hash Argon2 (gerar via um endpoint admin temporário ou seed manual). Sem usuário, `Login` retorna `USER_NOT_FOUND` (200 com `Success=false`, `Message="Usuário não encontrado."`) — o que **já valida o pipeline pt-BR e o fluxo**.

Run:
```bash
curl -s -X POST http://localhost:<porta>/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"x@x.com","password":"123456"}'
```
Expected (sem usuário): `{"success":false,"message":"Usuário não encontrado.", ...}`. Isso confirma: roteamento, binding, service, repositório (query no banco), tradução pt-BR.

- [ ] **Step 4: Parar a API**

Encerrar o processo `dotnet run`.

- [ ] **Step 5: Commit final (se houver ajustes)**

Qualquer correção de namespace/using descoberta no smoke test entra num commit `fix(...)`.

---

## Self-Review (preenchido)

**Spec coverage:**
- §1/§2 escopo e decisões → Tasks 1–11. ✅
- §5 entidades/models (fiel ao DDL, quoting) → Tasks 2, 3 + Global Constraints. ✅
- §6 repositórios (GetByEmail, delete custom) → Task 4. ✅
- §7 services (UserService/AuthService, transações, validações) → Tasks 7, 8. ✅
- §8 controllers ResultApi → Task 9. ✅
- §9 DTOs → Task 5. ✅
- §10 mapa de erros pt-BR → Task 6. ✅
- §11 pipeline de sessão (validar assinatura, GetUserLogged) → Task 10. ✅
- §12 seed de roles → Task 11. ✅
- §13 verificação (build + smoke) → cada task + Task 12. ✅
- §14 riscos → resolvidos: quoting (Global Constraints + delete custom Task 4 + verificação GetByKey Task 7); JWT key (Task 1); ApiContextVo (já existe, endurecido Task 10); i18n (Task 6). ✅

**Type consistency:** `UserEntity.User` (long, PK) consistente em Mod/Entity/Service/Controller. `GetRoleCodesByUser`→`List<string>` consumido em `Me`/`ListManaged`/`EnsureAdmin`. `SessionVo`→`SessionDto` via MapTo (campos `Token/User/Name/Authenticated/Idiom` existem em ambos). `Constants.RoleCode.ADMIN` definido (Task 6) antes de usado (Tasks 7,8). ✅

**Riscos residuais conhecidos (não bloqueiam, sinalizados nos steps):**
1. `GetByKey` com `"user"` quotado — verificado no Task 7 Step 3; fallback `GetById` custom documentado.
2. Ambiguidade de `[Column]`/`[Table]` (custom vs DataAnnotations) — resolução de `using` no Task 2 Step 1.
3. Binding do `Delete([FromBody] long)` — confirmar contrato com o frontend depois.
