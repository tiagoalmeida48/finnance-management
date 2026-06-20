using Finnance.Api.Modules.Common.Application.Interfaces;
using Finnance.Api.Modules.User.Domain.Entities;

namespace Finnance.Api.Modules.User.Application.Interfaces;

public interface IRoleService : IBaseService<RoleEntity>
{
    RoleEntity Get(long role);

    bool Exist(long role);
}
