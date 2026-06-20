using Finnance.Api.Modules.Common.Domain.Interfaces;
using Finnance.Api.Modules.User.Domain.Entities;

namespace Finnance.Api.Modules.User.Domain.Interfaces;

public interface IRoleRepository : IBaseRepository<RoleEntity>
{
    List<RoleEntity> Search(long role = 0,
                            string name = null,
                            bool active = false,
                            int quantity = 0);
}
