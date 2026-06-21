using Dapper.Contrib.Extensions;
using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.AuditLog.Repository.Models;

[Table("audit_log")]
public class AuditLogMod : BaseModel
{
    [Key]
    [Column("audit_log")]
    public long AuditLog { get; set; }

    [Column("audit_action")]
    public long AuditAction { get; set; }

    [Column("table_name")]
    public string TableName { get; set; }

    [Column("record")]
    public long Record { get; set; }

    [Column("old_data", isJsonColumn: true)]
    public string OldData { get; set; }

    [Column("new_data", isJsonColumn: true)]
    public string NewData { get; set; }

    [Column("changed_by")]
    public long ChangedBy { get; set; }

    [Column("description")]
    public string Description { get; set; }
}
