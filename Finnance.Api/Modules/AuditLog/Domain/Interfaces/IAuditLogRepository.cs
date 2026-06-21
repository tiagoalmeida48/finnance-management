using Finnance.Api.Modules.AuditLog.Domain.Entities;
using Finnance.Api.Modules.Common.Domain.Interfaces;

namespace Finnance.Api.Modules.AuditLog.Domain.Interfaces;

public interface IAuditLogRepository : IBaseRepository<AuditLogEntity>
{
    List<AuditLogEntity> Search(long auditLog = 0,
                                long changedBy = 0,
                                string tableName = null,
                                long record = 0,
                                long auditAction = 0,
                                int quantity = 0);
}
