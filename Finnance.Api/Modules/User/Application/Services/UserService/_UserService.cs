using Finnance.Api.Modules.Common.Application.Services;
using Finnance.Api.Modules.User.Application.Interfaces;
using Finnance.Api.Modules.User.Domain.Entities;
using Finnance.Api.Modules.User.Domain.Interfaces;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.User.Application.Services;

public partial class UserService(IUserRepository userRepository) : BaseService<UserEntity>(userRepository), IUserService
{
    public long CreateUser(UserEntity entity, string rawPassword, bool isAdmin)
    {
        entity.ValidateCreate();
        UserEntity.ValidatePassword(rawPassword);
        ValidateEmailUnique(entity.Email, 0);

        entity.PasswordHash = Argon2Helper.GenerateHashPassword(rawPassword);
        entity.IsAdmin = isAdmin;

        using var tran = GetTransaction();
        var userId = userRepository.Create(entity);
        tran.Complete();
        return userId;
    }

    public bool UpdateUser(UserEntity entity, bool isAdmin)
    {
        entity.ValidateUpdate();
        ValidateEmailUnique(entity.Email, entity.User);

        var current = Get(entity.User);
        current.Email = entity.Email;
        current.FullName = entity.FullName;
        current.IsAdmin = isAdmin;

        using var tran = GetTransaction();
        userRepository.Update(current);
        tran.Complete();

        return true;
    }

    public bool UpdateOwnProfile(long user, string fullName)
    {
        if (fullName.IsEmpty())
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);

        var current = Get(user);
        current.FullName = fullName;

        using var tran = GetTransaction();
        userRepository.Update(current);
        tran.Complete();

        return true;
    }

    public bool UpdateUserPassword(long user, string rawPassword)
    {
        UserEntity.ValidatePassword(rawPassword);

        var current = Get(user);
        current.PasswordHash = Argon2Helper.GenerateHashPassword(rawPassword);

        using var tran = GetTransaction();
        userRepository.Update(current);
        tran.Complete();
        
        return true;
    }

    public bool DeleteUser(long user, long currentUser)
    {
        if (user == currentUser)
            throw new ApplicationException(Constants.ErrorMessage.CannotDeleteSelf);

        var current = Get(user);

        using var tran = GetTransaction();
        userRepository.Delete(current);
        tran.Complete();

        return true;
    }

    public void EnsureAdmin(long currentUser)
    {
        var current = Get(currentUser);
        if (!current.IsAdmin)
            throw new ApplicationException(Constants.ErrorMessage.ErrorAuthorization);
    }
}
