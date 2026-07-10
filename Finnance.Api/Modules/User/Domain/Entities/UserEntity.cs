using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;
using Finnance.Api.Shared.BaseClass;
using System.Net.Mail;

namespace Finnance.Api.Modules.User.Domain.Entities;

public class UserEntity : BaseEntity
{
    public long User { get; set; }

    public string Email { get; set; }

    public string PasswordHash { get; set; }

    public string FullName { get; set; }

    public string AvatarUrl { get; set; }

    public string Phone { get; set; }

    public bool MarketingConsent { get; set; }

    public DateTime? MarketingConsentAt { get; set; }

    public string MarketingConsentSource { get; set; }

    public string MarketingConsentVersion { get; set; }

    public DateTime? MarketingOptOutAt { get; set; }

    public string Currency { get; set; }

    public string Locale { get; set; }

    public bool Active { get; set; }

    public bool SubscriptionBlocked { get; set; }

    public bool IsAdmin { get; set; }

    public int TokenVersion { get; set; }

    public bool EmailVerified { get; set; }

    public string VerifyToken { get; set; }

    public DateTime? VerifyTokenExpires { get; set; }

    public string ResetToken { get; set; }

    public DateTime? ResetTokenExpires { get; set; }

    public override void ValidateCreate()
    {
        Email = Email?.Trim().ToLowerInvariant();
        Currency = Currency.IsEmpty() ? "BRL" : Currency;
        Locale = Locale.IsEmpty() ? "PTBR" : Locale;
        Active = true;
        
        if (Email.IsEmpty())
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);

        ValidateIdentityFields();
    }

    public override void ValidateUpdate()
    {
        Email = Email?.Trim().ToLowerInvariant();
        if (User <= 0)
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);

        if (Email.IsEmpty())
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);

        ValidateIdentityFields();
    }

    public static void ValidatePassword(string rawPassword)
    {
        if (rawPassword.IsEmpty())
            throw new ApplicationException(Constants.ErrorMessage.EmptyPassword);

        if (rawPassword.Length < 12)
            throw new ApplicationException(Constants.ErrorMessage.NumberMinCharactersPassword);

        if (rawPassword.Length > 128)
            throw new ApplicationException(Constants.ErrorMessage.NumberMaxCharactersPassword);
    }

    public static string NormalizePhone(string phone)
    {
        if (phone.IsEmpty())
            return null;

        if (phone.Length > 32)
            throw new ApplicationException(Constants.ErrorMessage.InvalidPhone);

        var trimmedPhone = phone.Trim();
        var digits = new string(trimmedPhone.Where(char.IsDigit).ToArray());
        var hasInternationalPrefix = trimmedPhone.StartsWith('+') || digits.StartsWith("00");
        if (digits.StartsWith("00"))
            digits = digits[2..];

        if (!hasInternationalPrefix && digits.Length is 10 or 11)
            digits = $"55{digits}";

        if (digits.Length < 10 || digits.Length > 15)
            throw new ApplicationException(Constants.ErrorMessage.InvalidPhone);

        return $"+{digits}";
    }

    private void ValidateIdentityFields()
    {
        if (Email.Length > 254 || !MailAddress.TryCreate(Email, out var address)
                               || !string.Equals(address.Address, Email, StringComparison.OrdinalIgnoreCase))
            throw new ApplicationException(Constants.ErrorMessage.InvalidEmail);

        if (FullName?.Length > 200)
            throw new ApplicationException(Constants.ErrorMessage.InvalidFullName);
    }
}
