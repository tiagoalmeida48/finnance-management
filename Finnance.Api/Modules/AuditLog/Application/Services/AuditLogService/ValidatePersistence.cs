using Finnance.Api.Modules.AuditLog.Domain.Entities;

namespace Finnance.Api.Modules.AuditLog.Application.Services;

public partial class AuditLogService
{
    private void ValidateCreate(AuditLogEntity entity)
    {
        entity.ValidateCreate();
    }
}
