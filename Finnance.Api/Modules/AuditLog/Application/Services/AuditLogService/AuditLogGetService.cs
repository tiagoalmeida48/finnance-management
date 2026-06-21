using Finnance.Api.Modules.AuditLog.Domain.Entities;

namespace Finnance.Api.Modules.AuditLog.Application.Services;

public partial class AuditLogService
{
    public List<AuditLogEntity> List(int quantity = 0)
    {
        return auditLogRepository.Search(quantity: quantity);
    }

    public List<AuditLogEntity> Search(long changedBy = 0,
                                       string tableName = null,
                                       long record = 0,
                                       long auditAction = 0,
                                       int quantity = 0)
    {
        return auditLogRepository.Search(changedBy: changedBy,
                                         tableName: tableName,
                                         record: record,
                                         auditAction: auditAction,
                                         quantity: quantity);
    }
}
