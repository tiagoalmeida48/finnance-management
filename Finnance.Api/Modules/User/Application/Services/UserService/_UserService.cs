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
    private const string MarketingConsentSource = "profile";
    private const string MarketingConsentVersion = "2026-07-10";

    private static string NewToken() => Convert.ToHexString(RandomNumberGenerator.GetBytes(32)).ToLowerInvariant();

    private static string HashToken(string token)
    {
        return Convert.ToHexString(SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(token))).ToLowerInvariant();
    }

    public UserEntity ProvisionFromPurchase(string email, string fullName, string phone)
    {
        var entity = new UserEntity
        {
            Email = email,
            FullName = fullName.IsEmpty() ? email : fullName,
            Phone = NormalizePurchasePhone(phone)
        };
        entity.ValidateCreate();
        ValidateEmailUnique(entity.Email, 0);

        entity.PasswordHash = Argon2Helper.GenerateHashPassword(NewToken());
        entity.IsAdmin = false;
        entity.EmailVerified = true;
        entity.SubscriptionBlocked = true;
        var resetToken = NewToken();
        entity.ResetToken = HashToken(resetToken);
        entity.ResetTokenExpires = DateTime.UtcNow.AddHours(24);

        using var tran = GetTransaction();
        entity.User = userRepository.Create(entity);
        tran.Complete();

        emailService.SendPurchaseWelcome(entity.Email, resetToken);
        return entity;
    }

    public bool SyncPhoneFromPurchase(long user, string phone)
    {
        var normalizedPhone = NormalizePurchasePhone(phone);
        if (normalizedPhone.IsEmpty())
            return false;

        var current = Get(user);
        if (current.Phone.IsNotEmpty())
            return false;

        current.Phone = normalizedPhone;

        using var tran = GetTransaction();
        userRepository.Update(current);
        tran.Complete();
        return true;
    }

    public bool ForgotPassword(string email)
    {
        if (email.IsEmpty() || email.Length > 254)
            return true;

        var current = userRepository.Search(email: email, quantity: 1).FirstOrDefault();
        if (current == null)
            return true;

        var resetToken = NewToken();
        current.ResetToken = HashToken(resetToken);
        current.ResetTokenExpires = DateTime.UtcNow.AddMinutes(30);

        using var tran = GetTransaction();
        userRepository.Update(current);
        tran.Complete();

        emailService.SendPasswordReset(current.Email, resetToken);
        return true;
    }

    public bool ResetPassword(string token, string rawPassword)
    {
        if (token.IsEmpty() || token.Length != 64)
            throw new ApplicationException(Constants.ErrorMessage.InvalidToken);

        UserEntity.ValidatePassword(rawPassword);

        using var tran = GetTransaction();
        var current = userRepository.SearchByResetTokenForUpdate(HashToken(token));
        if (current == null || current.ResetTokenExpires < DateTime.UtcNow)
            throw new ApplicationException(Constants.ErrorMessage.InvalidToken);

        current.PasswordHash = Argon2Helper.GenerateHashPassword(rawPassword);
        current.ResetToken = null;
        current.ResetTokenExpires = null;
        current.EmailVerified = true;
        current.TokenVersion++;

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
        entity.Active = true;

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

        if (fullName.Length > 200)
            throw new ApplicationException(Constants.ErrorMessage.InvalidFullName);

        if (avatarUrl.IsNotEmpty()
            && (!Uri.TryCreate(avatarUrl, UriKind.Absolute, out var avatar)
                || avatar.Scheme != Uri.UriSchemeHttps
                || avatarUrl.Length > 2048))
            throw new ApplicationException(Constants.ErrorMessage.InvalidAvatarUrl);

        var current = Get(user);
        current.FullName = fullName;
        current.AvatarUrl = avatarUrl ?? current.AvatarUrl;

        using var tran = GetTransaction();
        userRepository.Update(current);
        tran.Complete();

        return true;
    }

    public bool UpdateMarketingPreferences(long user, string phone, bool marketingConsent)
    {
        var normalizedPhone = UserEntity.NormalizePhone(phone);
        if (marketingConsent && normalizedPhone.IsEmpty())
            throw new ApplicationException(Constants.ErrorMessage.PhoneRequiredForMarketing);

        var current = Get(user);
        var phoneChanged = !string.Equals(current.Phone, normalizedPhone, StringComparison.Ordinal);
        var consentGranted = marketingConsent && (!current.MarketingConsent || phoneChanged);
        var consentRevoked = !marketingConsent && current.MarketingConsent;

        current.Phone = normalizedPhone;
        current.MarketingConsent = marketingConsent;

        if (consentGranted)
        {
            current.MarketingConsentAt = DateTime.UtcNow;
            current.MarketingConsentSource = MarketingConsentSource;
            current.MarketingConsentVersion = MarketingConsentVersion;
            current.MarketingOptOutAt = null;
        }

        if (consentRevoked)
            current.MarketingOptOutAt = DateTime.UtcNow;

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
        current.TokenVersion++;

        using var tran = GetTransaction();
        userRepository.Update(current);
        tran.Complete();
        
        return true;
    }

    public bool UpdateOwnPassword(long user, string currentPassword, string rawPassword)
    {
        var current = Get(user);
        if (currentPassword.IsEmpty() || currentPassword.Length > 128
            || !Argon2Helper.VerifyPassword(currentPassword, current.PasswordHash))
            throw new ApplicationException(Constants.ErrorMessage.UserInvalidPassword);

        return UpdateUserPassword(user, rawPassword);
    }

    public bool RevokeSessions(long user)
    {
        var current = Get(user);
        current.TokenVersion++;

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

    private static string NormalizePurchasePhone(string phone)
    {
        try
        {
            return UserEntity.NormalizePhone(phone);
        }
        catch (ApplicationException)
        {
            return null;
        }
    }
}
