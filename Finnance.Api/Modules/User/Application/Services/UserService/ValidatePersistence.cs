using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.User.Application.Services;

public partial class UserService
{
    private void ValidateEmailUnique(string email, long ignoreUser)
    {
        var existing = userRepository.Search(email: email, quantity: 1);

        if (existing.Any(item => item.User != ignoreUser))
            throw new ApplicationException(Constants.ErrorMessage.FieldAlreadyExists);
    }
}
