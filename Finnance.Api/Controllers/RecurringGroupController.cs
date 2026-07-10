using Microsoft.AspNetCore.Mvc;
using Finnance.Api.Modules.RecurringGroup.Application.Dto;
using Finnance.Api.Modules.RecurringGroup.Application.Interfaces;
using Finnance.Api.Modules.RecurringGroup.Domain.Entities;
using Finnance.Api.Security;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Controllers;

public class RecurringGroupController(IRecurringGroupService recurringGroupService) : ControllerBase
{
    [Authorization(subscription: true)]
    [HttpGet]
    public ResultApi<List<RecurringGroupDisplayDto>> List()
    {
        var result = recurringGroupService.List(UserLogged.user);
        return new ResultApi<List<RecurringGroupDisplayDto>> { Result = result.MapTo<List<RecurringGroupDisplayDto>>() };
    }

    [Authorization(subscription: true)]
    [HttpGet]
    public ResultApi<RecurringGroupDisplayDto> Get([FromQuery] long recurringGroup)
    {
        var result = recurringGroupService.Get(recurringGroup, UserLogged.user);
        return new ResultApi<RecurringGroupDisplayDto> { Result = result.MapTo<RecurringGroupDisplayDto>() };
    }

    [Authorization(subscription: true)]
    [HttpPost]
    public ResultApi<long> Create([FromBody] RecurringGroupCreateDto dto)
    {
        var entity = new RecurringGroupEntity();
        var id = recurringGroupService.Create(entity, UserLogged.user);
        return new ResultApi<long> { Result = id };
    }

    [Authorization(subscription: true)]
    [HttpDelete]
    public ResultApi<bool> Delete([FromBody] long recurringGroup)
    {
        return new ResultApi<bool> { Result = recurringGroupService.Delete(recurringGroup, UserLogged.user) };
    }
}
