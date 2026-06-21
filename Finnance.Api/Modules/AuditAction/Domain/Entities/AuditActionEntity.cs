using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.AuditAction.Domain.Entities;

public class AuditActionEntity : BaseEntity
{
    public long AuditAction { get; set; }

    public string Name { get; set; }

    public bool Active { get; set; }
}
