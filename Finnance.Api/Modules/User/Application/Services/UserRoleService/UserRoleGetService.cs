using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.User.Application.Services;

public partial class UserRoleService
{
    public void EnsureAdmin(long user)
    {
        if (!HasRole(user, Constants.RoleId.ADMIN))
            throw new ApplicationException(Constants.ErrorMessage.ErrorAuthorization);
    }

    public bool HasRole(long user, long role)
    {
        return GetRoleIds(user).Contains(role);
    }

    public List<long> GetRoleIds(long user)
    {
        return userRoleRepository.SearchRoleIds(user);
    }

    public List<(long User, bool IsAdmin)> ListAdminFlags()
    {
        return userRoleRepository.SearchAdminFlags(Constants.RoleId.ADMIN);
    }
}
