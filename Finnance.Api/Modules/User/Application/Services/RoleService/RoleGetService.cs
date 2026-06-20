using Finnance.Api.Modules.User.Domain.Entities;

namespace Finnance.Api.Modules.User.Application.Services;

public partial class RoleService
{
    public RoleEntity Get(long role)
    {
        return roleRepository.Search(role, active: true, quantity: 1).FirstOrDefault();
    }

    public bool Exist(long role)
    {
        return Get(role) != null;
    }
}
