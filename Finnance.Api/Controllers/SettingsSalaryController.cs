using Microsoft.AspNetCore.Mvc;
using Finnance.Api.Modules.SettingsSalary.Application.Dto;
using Finnance.Api.Modules.SettingsSalary.Application.Interfaces;
using Finnance.Api.Modules.SettingsSalary.Domain.Entities;
using Finnance.Api.Security;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Controllers;

public class SettingsSalaryController(ISettingsSalaryService settingsSalaryService) : ControllerBase
{
    [Authorization()]
    [HttpGet]
    public ResultApi<List<SalarySettingDisplayDto>> History()
    {
        var history = settingsSalaryService.GetHistory(UserLogged.user);
        return new ResultApi<List<SalarySettingDisplayDto>> { Result = history.MapTo<List<SalarySettingDisplayDto>>() };
    }

    [Authorization()]
    [HttpGet]
    public ResultApi<SalarySettingDisplayDto> Current()
    {
        var current = settingsSalaryService.GetCurrent(UserLogged.user);
        return new ResultApi<SalarySettingDisplayDto> { Result = current.MapTo<SalarySettingDisplayDto>() };
    }

    [Authorization()]
    [HttpGet]
    public ResultApi<SalarySettingDisplayDto> Open()
    {
        var open = settingsSalaryService.GetOpen(UserLogged.user);
        return new ResultApi<SalarySettingDisplayDto> { Result = open.MapTo<SalarySettingDisplayDto>() };
    }

    [Authorization()]
    [HttpPost]
    public ResultApi<long> Create([FromBody] SalarySettingCreateDto dto)
    {
        var entity = dto.MapTo<SettingsSalaryEntity>();
        var id = settingsSalaryService.CreateWithValidity(entity, UserLogged.user);
        return new ResultApi<long> { Result = id };
    }

    [Authorization()]
    [HttpPut]
    public ResultApi<bool> Update([FromBody] SalarySettingUpdateDto dto)
    {
        var entity = dto.MapTo<SettingsSalaryEntity>();
        return new ResultApi<bool> { Result = settingsSalaryService.UpdateSetting(entity, UserLogged.user) };
    }

    [Authorization()]
    [HttpPut]
    public ResultApi<bool> Close([FromBody] SalarySettingUpdateDto dto)
    {
        return new ResultApi<bool> { Result = settingsSalaryService.CloseSetting(UserLogged.user, dto.SettingsSalary, dto.DateEnd) };
    }

    [Authorization()]
    [HttpPost]
    public ResultApi<SalarySimulationResultDto> Simulate([FromBody] SalarySimulationInputDto dto)
    {
        return new ResultApi<SalarySimulationResultDto> { Result = settingsSalaryService.SimulatePayroll(dto) };
    }
}
