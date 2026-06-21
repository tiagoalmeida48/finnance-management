using Finnance.Api.Modules.AuditAction.Application.Interfaces;
using Finnance.Api.Modules.AuditAction.Domain.Entities;
using Finnance.Api.Modules.AuditAction.Domain.Interfaces;
using Finnance.Api.Modules.Common.Application.Services;

namespace Finnance.Api.Modules.AuditAction.Application.Services;

public partial class AuditActionService(IAuditActionRepository auditActionRepository) : BaseService<AuditActionEntity>(auditActionRepository), IAuditActionService;
