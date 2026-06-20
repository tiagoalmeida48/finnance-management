using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.User.Domain.Entities;

public class RoleEntity : BaseEntity
{
    public long Role { get; set; }

    public string Name { get; set; }

    public bool Active { get; set; }
}
