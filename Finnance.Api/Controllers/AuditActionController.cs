using Microsoft.AspNetCore.Mvc;
using Finnance.Api.Modules.AuditAction.Application.Dto;
using Finnance.Api.Modules.AuditAction.Application.Interfaces;
using Finnance.Api.Security;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Controllers;

public class AuditActionController(IAuditActionService auditActionService) : ControllerBase
{
    [Authorization()]
    [HttpGet]
    public ResultApi<List<AuditActionDisplayDto>> List()
    {
        return new ResultApi<List<AuditActionDisplayDto>> { Result = auditActionService.List().MapTo<List<AuditActionDisplayDto>>() };
    }

    [Authorization()]
    [HttpGet]
    public ResultApi<AuditActionDisplayDto> Get([FromQuery] long auditAction)
    {
        return new ResultApi<AuditActionDisplayDto> { Result = auditActionService.Get(auditAction).MapTo<AuditActionDisplayDto>() };
    }
}
