using Finnance.Api.Modules.AuditAction.Domain.Entities;

namespace Finnance.Api.Modules.AuditAction.Application.Services;

public partial class AuditActionService
{
    public List<AuditActionEntity> List()
    {
        return auditActionRepository.Search(active: true);
    }

    public AuditActionEntity Get(long auditAction)
    {
        return auditActionRepository.Search(auditAction, active: true, quantity: 1).FirstOrDefault();
    }

    public bool Exist(long auditAction)
    {
        return Get(auditAction) != null;
    }
}
