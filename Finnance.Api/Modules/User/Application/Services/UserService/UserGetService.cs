using Finnance.Api.Modules.User.Application.Dto;
using Finnance.Api.Modules.User.Domain.Entities;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.User.Application.Services;

public partial class UserService
{
    public UserEntity Get(long user)
    {
        var current = userRepository.Search(user, quantity: 1).FirstOrDefault();
        if (current == null)
            throw new ApplicationException(Constants.ErrorMessage.UserNotFound);

        return current;
    }

    public UserEntity GetByEmail(string email)
    {
        var current = userRepository.Search(email: email, quantity: 1).FirstOrDefault();
        if (current == null)
            throw new ApplicationException(Constants.ErrorMessage.UserNotFound);

        return current;
    }

    public List<UserLightDto> ListManaged()
    {
        var users = userRepository.All().ToList();

        return users.Select(u => new UserLightDto
        {
            User = u.User,
            Email = u.Email,
            FullName = u.FullName,
            Created = u.Created,
            IsAdmin = u.IsAdmin
        }).ToList();
    }
}
