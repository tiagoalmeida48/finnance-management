using Finnance.Api.Modules.AuditLog.Application.Interfaces;
using Finnance.Api.Modules.AuditLog.Domain.Entities;
using Finnance.Api.Modules.AuditLog.Domain.Interfaces;
using Finnance.Api.Modules.Common.Application.Services;

namespace Finnance.Api.Modules.AuditLog.Application.Services;

public partial class AuditLogService(IAuditLogRepository auditLogRepository) : BaseService<AuditLogEntity>(auditLogRepository), IAuditLogService
{
    public long Create(AuditLogEntity entity)
    {
        ValidateCreate(entity);
        return auditLogRepository.Create(entity);
    }

    public long Record(long auditAction, string tableName, long record, string newData, long changedBy)
    {
        var entity = new AuditLogEntity
        {
            AuditAction = auditAction,
            TableName = tableName,
            Record = record,
            NewData = newData,
            ChangedBy = changedBy
        };

        return auditLogRepository.Create(entity);
    }
}
