using Finnance.Api.Modules.AuditAction.Domain.Entities;
using Finnance.Api.Modules.Common.Domain.Interfaces;

namespace Finnance.Api.Modules.AuditAction.Domain.Interfaces;

public interface IAuditActionRepository : IBaseRepository<AuditActionEntity>
{
    List<AuditActionEntity> Search(long auditAction = 0,
                                   string name = null,
                                   bool active = false,
                                   int quantity = 0);
}
