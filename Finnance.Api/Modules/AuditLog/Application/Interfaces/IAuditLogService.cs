using Finnance.Api.Modules.AuditLog.Domain.Entities;
using Finnance.Api.Modules.Common.Application.Interfaces;

namespace Finnance.Api.Modules.AuditLog.Application.Interfaces;

public interface IAuditLogService : IBaseService<AuditLogEntity>
{
    long Create(AuditLogEntity entity);

    long Record(long auditAction, string tableName, long record, string newData, long changedBy);

    List<AuditLogEntity> List(int quantity = 0);

    List<AuditLogEntity> Search(long changedBy = 0,
                                string tableName = null,
                                long record = 0,
                                long auditAction = 0,
                                int quantity = 0);
}
