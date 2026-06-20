using Dapper.Contrib.Extensions;
using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.User.Repository.Models;

[Table("user_role")]
public class UserRoleMod : BaseModel
{
    [ExplicitKey]
    [Column("\"user\"")]
    public long User { get; set; }

    [ExplicitKey]
    [Column("\"role\"")]
    public long Role { get; set; }

    [Column("active")]
    public bool Active { get; set; }
}
