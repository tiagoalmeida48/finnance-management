using Dapper.Contrib.Extensions;
using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.AuditAction.Repository.Models;

[Table("audit_action")]
public class AuditActionMod : BaseModel
{
    [Key]
    [Column("audit_action")]
    public long AuditAction { get; set; }

    [Column("name")]
    public string Name { get; set; }

    [Column("active")]
    public bool Active { get; set; }
}
