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
    [Authorization(admin: true)]
    [HttpGet]
    public ResultApi<List<SalarySettingDisplayDto>> History()
    {
        var history = settingsSalaryService.GetHistory(UserLogged.user);
        return new ResultApi<List<SalarySettingDisplayDto>> { Result = history.MapTo<List<SalarySettingDisplayDto>>() };
    }

    [Authorization(admin: true)]
    [HttpGet]
    public ResultApi<SalarySettingDisplayDto> Current()
    {
        var current = settingsSalaryService.GetCurrent(UserLogged.user);
        return new ResultApi<SalarySettingDisplayDto> { Result = current.MapTo<SalarySettingDisplayDto>() };
    }

    [Authorization(admin: true)]
    [HttpGet]
    public ResultApi<SalarySettingDisplayDto> Open()
    {
        var open = settingsSalaryService.GetOpen(UserLogged.user);
        return new ResultApi<SalarySettingDisplayDto> { Result = open.MapTo<SalarySettingDisplayDto>() };
    }

    [Authorization(admin: true)]
    [HttpPost]
    public ResultApi<long> Create([FromBody] SalarySettingCreateDto dto)
    {
        var entity = dto.MapTo<SettingsSalaryEntity>();
        var id = settingsSalaryService.CreateWithValidity(entity, UserLogged.user);
        return new ResultApi<long> { Result = id };
    }

    [Authorization(admin: true)]
    [HttpPut]
    public ResultApi<bool> Update([FromBody] SalarySettingUpdateDto dto)
    {
        var entity = dto.MapTo<SettingsSalaryEntity>();
        return new ResultApi<bool> { Result = settingsSalaryService.UpdateSetting(entity, UserLogged.user) };
    }

    [Authorization(admin: true)]
    [HttpPut]
    public ResultApi<bool> Close([FromBody] SalarySettingUpdateDto dto)
    {
        return new ResultApi<bool> { Result = settingsSalaryService.CloseSetting(UserLogged.user, dto.SettingsSalary, dto.DateEnd) };
    }

    [Authorization(admin: true)]
    [HttpDelete]
    public ResultApi<bool> DeleteCurrent()
    {
        return new ResultApi<bool> { Result = settingsSalaryService.DeleteCurrentAndRestorePrevious(UserLogged.user) };
    }

    [Authorization(admin: true)]
    [HttpPost]
    public ResultApi<PayrollResultDto> Calculate([FromBody] PayrollCalculateDto dto)
    {
        return new ResultApi<PayrollResultDto> { Result = settingsSalaryService.CalculatePayroll(dto, UserLogged.user) };
    }
}
