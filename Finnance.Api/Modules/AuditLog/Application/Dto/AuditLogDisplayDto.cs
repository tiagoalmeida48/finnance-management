namespace Finnance.Api.Modules.AuditLog.Application.Dto;

public class AuditLogDisplayDto
{
    public long AuditLog { get; set; }

    public long AuditAction { get; set; }

    public string TableName { get; set; }

    public long Record { get; set; }

    public string OldData { get; set; }

    public string NewData { get; set; }

    public long ChangedBy { get; set; }

    public string Description { get; set; }

    public DateTime Created { get; set; }
}
