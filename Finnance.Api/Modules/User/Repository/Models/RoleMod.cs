using Dapper.Contrib.Extensions;
using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.User.Repository.Models;

[Table("\"role\"")]
public class RoleMod : BaseModel
{
    [Key]
    [Column("\"role\"")]
    public long Role { get; set; }

    [Column("name")]
    public string Name { get; set; }

    [Column("active")]
    public bool Active { get; set; }
}
