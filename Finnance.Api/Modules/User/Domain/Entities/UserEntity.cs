using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;
using Finnance.Api.Shared.BaseClass;

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
        Currency = Currency.IsEmpty() ? "BRL" : Currency;
        Locale = Locale.IsEmpty() ? "PTBR" : Locale;
        Active = true;
        
        if (Email.IsEmpty())
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);
    }

    public override void ValidateUpdate()
    {
        if (User <= 0)
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);

        if (Email.IsEmpty())
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);
    }

    public static void ValidatePassword(string rawPassword)
    {
        if (rawPassword.IsEmpty())
            throw new ApplicationException(Constants.ErrorMessage.EmptyPassword);

        if (rawPassword.Length < 6)
            throw new ApplicationException(Constants.ErrorMessage.NumberMinCharactersPassword);
    }
}
