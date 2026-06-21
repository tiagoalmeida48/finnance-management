using Dapper.Contrib.Extensions;
using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.RecurringGroup.Repository.Models;

[Table("recurring_group")]
public class RecurringGroupMod : BaseModel
{
    [Key]
    [Column("recurring_group")]
    public long RecurringGroup { get; set; }

    [Column("\"user\"")]
    public long User { get; set; }

    [Column("active")]
    public bool Active { get; set; }
}
