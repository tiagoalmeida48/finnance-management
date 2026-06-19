using Finnance.Api.Modules.User.Application.Dto;
using Finnance.Api.Modules.User.Domain.Entities;
using Finnance.Api.Shared;
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
        var hash = Argon2Helper.GenerateHashPassword(rawPassword);
        return _userRepository.UpdatePassword(user, hash);
    }

    public bool DeleteUser(long user, long currentUser)
    {
        if (user == currentUser)
            throw new BusinessError("Você não pode excluir seu próprio usuário.");

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
