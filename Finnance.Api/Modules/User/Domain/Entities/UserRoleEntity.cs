using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.User.Domain.Entities;

public class UserRoleEntity : BaseEntity
{
    public long User { get; set; }

    public long Role { get; set; }

    public bool Active { get; set; }
}
