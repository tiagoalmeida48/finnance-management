using Dapper.Contrib.Extensions;
using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.User.Repository.Models;

[Table("user_role")]
public class UserRoleMod : BaseModel
{
    [Key][Column("user_role")] public long UserRole { get; set; }
    [Column("\"user\"")] public long User { get; set; }
    [Column("\"role\"")] public long Role { get; set; }
    [Column("active")] public bool Active { get; set; }
}
