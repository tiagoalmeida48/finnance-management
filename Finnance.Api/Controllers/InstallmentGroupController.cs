using Microsoft.AspNetCore.Mvc;
using Finnance.Api.Modules.InstallmentGroup.Application.Dto;
using Finnance.Api.Modules.InstallmentGroup.Application.Interfaces;
using Finnance.Api.Modules.InstallmentGroup.Domain.Entities;
using Finnance.Api.Security;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Controllers;

public class InstallmentGroupController(IInstallmentGroupService installmentGroupService) : ControllerBase
{
    [Authorization()]
    [HttpGet]
    public ResultApi<List<InstallmentGroupDisplayDto>> List()
    {
        var groups = installmentGroupService.List(UserLogged.user);
        return new ResultApi<List<InstallmentGroupDisplayDto>> { Result = groups.MapTo<List<InstallmentGroupDisplayDto>>() };
    }

    [Authorization()]
    [HttpGet]
    public ResultApi<InstallmentGroupDisplayDto> Get([FromQuery] long installmentGroup)
    {
        var group = installmentGroupService.Get(installmentGroup, UserLogged.user);
        return new ResultApi<InstallmentGroupDisplayDto> { Result = group.MapTo<InstallmentGroupDisplayDto>() };
    }

    [Authorization()]
    [HttpPost]
    public ResultApi<long> Create([FromBody] InstallmentGroupCreateDto dto)
    {
        var entity = new InstallmentGroupEntity { TotalInstallments = dto.TotalInstallments };
        var id = installmentGroupService.Create(entity, UserLogged.user);
        return new ResultApi<long> { Result = id };
    }

    [Authorization()]
    [HttpDelete]
    public ResultApi<bool> Delete([FromBody] long installmentGroup)
    {
        return new ResultApi<bool> { Result = installmentGroupService.Delete(installmentGroup, UserLogged.user) };
    }
}
