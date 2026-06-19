using Finnance.Api.Modules.Common.Domain.Interfaces;
using Finnance.Api.Modules.User.Domain.Entities;

namespace Finnance.Api.Modules.User.Domain.Interfaces;

public interface IRoleRepository : IBaseRepository<RoleEntity>
{
    RoleEntity GetByCode(string code);
}
