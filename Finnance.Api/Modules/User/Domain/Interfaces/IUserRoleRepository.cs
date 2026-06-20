using Finnance.Api.Modules.Common.Domain.Interfaces;
using Finnance.Api.Modules.User.Domain.Entities;

namespace Finnance.Api.Modules.User.Domain.Interfaces;

public interface IUserRoleRepository : IBaseRepository<UserRoleEntity>
{
    List<UserRoleEntity> Search(long user = 0,
                                long role = 0,
                                bool active = false,
                                int quantity = 0);

    List<long> SearchRoleIds(long user);

    List<(long User, bool IsAdmin)> SearchAdminFlags(long adminRole);
}
