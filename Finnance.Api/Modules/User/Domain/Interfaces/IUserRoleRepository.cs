using Finnance.Api.Modules.Common.Domain.Interfaces;
using Finnance.Api.Modules.User.Domain.Entities;

namespace Finnance.Api.Modules.User.Domain.Interfaces;

public interface IUserRoleRepository : IBaseRepository<UserRoleEntity>
{
    IEnumerable<string> GetRoleCodesByUser(long user);
    bool ExistUserRole(long user, long role);
    bool DeleteByUser(long user);
}
