using Microsoft.AspNetCore.Mvc;
using Finnance.Api.Modules.AuditLog.Application.Dto;
using Finnance.Api.Modules.AuditLog.Application.Interfaces;
using Finnance.Api.Security;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Controllers;

public class AuditLogController(IAuditLogService auditLogService) : ControllerBase
{
    [Authorization(admin: true)]
    [HttpGet]
    public ResultApi<List<AuditLogDisplayDto>> List([FromQuery] int quantity = 0)
    {
        return new ResultApi<List<AuditLogDisplayDto>> { Result = auditLogService.List(quantity).MapTo<List<AuditLogDisplayDto>>() };
    }

    [Authorization(admin: true)]
    [HttpGet]
    public ResultApi<List<AuditLogDisplayDto>> Search([FromQuery] long changedBy = 0,
                                                      [FromQuery] string tableName = null,
                                                      [FromQuery] long record = 0,
                                                      [FromQuery] long auditAction = 0,
                                                      [FromQuery] int quantity = 0)
    {
        var result = auditLogService.Search(changedBy, tableName, record, auditAction, quantity);
        return new ResultApi<List<AuditLogDisplayDto>> { Result = result.MapTo<List<AuditLogDisplayDto>>() };
    }
}
