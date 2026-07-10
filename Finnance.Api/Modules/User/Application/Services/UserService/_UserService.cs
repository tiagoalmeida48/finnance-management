using System.Security.Cryptography;
using Finnance.Api.Modules.Common.Application.Services;
using Finnance.Api.Modules.Notification.Application.Interfaces;
using Finnance.Api.Modules.User.Application.Interfaces;
using Finnance.Api.Modules.User.Domain.Entities;
using Finnance.Api.Modules.User.Domain.Interfaces;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.User.Application.Services;

public partial class UserService(IUserRepository userRepository, IEmailService emailService)
    : BaseService<UserEntity>(userRepository), IUserService
{
    private static string NewToken() => Convert.ToHexString(RandomNumberGenerator.GetBytes(32)).ToLowerInvariant();

    public long Register(string email, string fullName, string rawPassword)
    {
        var entity = new UserEntity { Email = email, FullName = fullName };
        entity.ValidateCreate();
        UserEntity.ValidatePassword(rawPassword);
        ValidateEmailUnique(entity.Email, 0);

        entity.PasswordHash = Argon2Helper.GenerateHashPassword(rawPassword);
        entity.IsAdmin = false;
        entity.EmailVerified = false;
        entity.VerifyToken = NewToken();
        entity.VerifyTokenExpires = DateTime.UtcNow.AddHours(48);

        using var tran = GetTransaction();
        var id = userRepository.Create(entity);
        tran.Complete();

        emailService.SendVerification(entity.Email, entity.VerifyToken);
        return id;
    }

    public UserEntity ProvisionFromPurchase(string email, string fullName)
    {
        var entity = new UserEntity { Email = email, FullName = fullName.IsEmpty() ? email : fullName };
        entity.ValidateCreate();
        ValidateEmailUnique(entity.Email, 0);

        entity.PasswordHash = Argon2Helper.GenerateHashPassword(NewToken());
        entity.IsAdmin = false;
        entity.EmailVerified = true;
        entity.ResetToken = NewToken();
        entity.ResetTokenExpires = DateTime.UtcNow.AddHours(72);

        using var tran = GetTransaction();
        entity.User = userRepository.Create(entity);
        tran.Complete();

        emailService.SendPurchaseWelcome(entity.Email, entity.ResetToken);
        return entity;
    }

    public bool VerifyEmail(string token)
    {
        if (token.IsEmpty())
            throw new ApplicationException(Constants.ErrorMessage.InvalidToken);

        var current = userRepository.SearchByToken("verify_token", token);
        if (current == null || current.VerifyTokenExpires < DateTime.UtcNow)
            throw new ApplicationException(Constants.ErrorMessage.InvalidToken);

        current.EmailVerified = true;
        current.VerifyToken = null;
        current.VerifyTokenExpires = null;

        using var tran = GetTransaction();
        userRepository.Update(current);
        tran.Complete();
        return true;
    }

    public bool ForgotPassword(string email)
    {
        if (email.IsEmpty())
            return true;

        var current = userRepository.Search(email: email, quantity: 1).FirstOrDefault();
        if (current == null)
            return true;

        current.ResetToken = NewToken();
        current.ResetTokenExpires = DateTime.UtcNow.AddHours(1);

        using var tran = GetTransaction();
        userRepository.Update(current);
        tran.Complete();

        emailService.SendPasswordReset(current.Email, current.ResetToken);
        return true;
    }

    public bool ResetPassword(string token, string rawPassword)
    {
        if (token.IsEmpty())
            throw new ApplicationException(Constants.ErrorMessage.InvalidToken);

        UserEntity.ValidatePassword(rawPassword);

        var current = userRepository.SearchByToken("reset_token", token);
        if (current == null || current.ResetTokenExpires < DateTime.UtcNow)
            throw new ApplicationException(Constants.ErrorMessage.InvalidToken);

        current.PasswordHash = Argon2Helper.GenerateHashPassword(rawPassword);
        current.ResetToken = null;
        current.ResetTokenExpires = null;
        current.EmailVerified = true;

        using var tran = GetTransaction();
        userRepository.Update(current);
        tran.Complete();
        return true;
    }

    public string ExportData(long user) => userRepository.ExportData(user);

    public long CreateUser(UserEntity entity, string rawPassword, bool isAdmin)
    {
        entity.ValidateCreate();
        UserEntity.ValidatePassword(rawPassword);
        ValidateEmailUnique(entity.Email, 0);

        entity.PasswordHash = Argon2Helper.GenerateHashPassword(rawPassword);
        entity.IsAdmin = isAdmin;
        entity.EmailVerified = true;

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

    public bool UpdateOwnProfile(long user, string fullName, string avatarUrl)
    {
        if (fullName.IsEmpty())
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);

        var current = Get(user);
        current.FullName = fullName;
        current.AvatarUrl = avatarUrl ?? current.AvatarUrl;

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
        current.Active = false;

        using var tran = GetTransaction();
        userRepository.Update(current);
        tran.Complete();

        return true;
    }

    public bool ToggleActive(long user, long currentUser)
    {
        var current = Get(user);
        if (current.Active && user == currentUser)
            throw new ApplicationException(Constants.ErrorMessage.CannotDeleteSelf);

        current.Active = !current.Active;

        using var tran = GetTransaction();
        userRepository.Update(current);
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
