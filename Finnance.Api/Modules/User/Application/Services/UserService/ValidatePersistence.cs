using Finnance.Api.Shared;
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
