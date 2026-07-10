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

    public UserEntity FindByEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email) || email.Length > 254)
            return null;

        return userRepository.Search(email: email.Trim().ToLowerInvariant(), quantity: 1).FirstOrDefault();
    }

    public List<UserLightDto> ListManaged(bool includeInactive = false)
    {
        var users = userRepository.Search(active: !includeInactive);

        return users.Select(u => new UserLightDto
        {
            User = u.User,
            Email = u.Email,
            FullName = u.FullName,
            Created = u.Created,
            IsAdmin = u.IsAdmin,
            Active = u.Active,
            SubscriptionBlocked = u.SubscriptionBlocked
        }).ToList();
    }
}
