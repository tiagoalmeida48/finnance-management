using Finnance.Api.Modules.AuditAction.Domain.Entities;
using Finnance.Api.Modules.Common.Application.Interfaces;

namespace Finnance.Api.Modules.AuditAction.Application.Interfaces;

public interface IAuditActionService : IBaseService<AuditActionEntity>
{
    List<AuditActionEntity> List();

    AuditActionEntity Get(long auditAction);

    bool Exist(long auditAction);
}
