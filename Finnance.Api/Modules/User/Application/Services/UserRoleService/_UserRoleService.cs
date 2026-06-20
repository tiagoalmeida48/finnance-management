using Finnance.Api.Modules.Common.Application.Services;
using Finnance.Api.Modules.User.Application.Interfaces;
using Finnance.Api.Modules.User.Domain.Entities;
using Finnance.Api.Modules.User.Domain.Interfaces;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.User.Application.Services;

public partial class UserRoleService(IUserRoleRepository userRoleRepository,
                                     IRoleService roleService) : BaseService<UserRoleEntity>(userRoleRepository), IUserRoleService
{
    public void AssignRole(long user, long role)
    {
        if (!roleService.Exist(role))
            throw new ApplicationException(Constants.ErrorMessage.RegisterNotFound);

        if (HasRole(user, role)) return;

        userRoleRepository.Create(new UserRoleEntity { User = user, Role = role, Active = true });
    }

    public void SyncAdminRole(long user, bool isAdmin)
    {
        if (isAdmin)
            AssignRole(user, Constants.RoleId.ADMIN);
    }

    public void DeleteByUser(long user)
    {
        var userRoles = userRoleRepository.Search(user);

        foreach (var userRole in userRoles)
            userRoleRepository.Delete(userRole);
    }
}
