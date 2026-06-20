using Finnance.Api.Modules.Common.Application.Interfaces;
using Finnance.Api.Modules.User.Domain.Entities;

namespace Finnance.Api.Modules.User.Application.Interfaces;

public interface IUserRoleService : IBaseService<UserRoleEntity>
{
    void AssignRole(long user, long role);

    void SyncAdminRole(long user, bool isAdmin);

    void EnsureAdmin(long user);

    bool HasRole(long user, long role);

    void DeleteByUser(long user);

    List<long> GetRoleIds(long user);

    List<(long User, bool IsAdmin)> ListAdminFlags();
}
