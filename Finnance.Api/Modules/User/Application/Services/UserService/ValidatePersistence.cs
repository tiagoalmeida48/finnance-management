using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.User.Application.Services;

public partial class UserService
{
    private void ValidateEmailUnique(string email, long ignoreUser)
    {
        if (userRepository.Search(email: email, quantity: 1).IsNotEmpty())
            throw new ApplicationException(Constants.ErrorMessage.FieldAlreadyExists);
    }
}
