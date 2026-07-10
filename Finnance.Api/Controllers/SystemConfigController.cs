using Microsoft.AspNetCore.Mvc;
using Finnance.Api.Modules.SystemConfig.Application.Dto;
using Finnance.Api.Modules.SystemConfig.Application.Interfaces;
using Finnance.Api.Security;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Controllers;

public class SystemConfigController(ISystemConfigService systemConfigService) : ControllerBase
{
    [Authorization(subscription: true)]
    [HttpGet]
    public ResultApi<List<SystemConfigDisplayDto>> List()
    {
        return new ResultApi<List<SystemConfigDisplayDto>> { Result = systemConfigService.List().MapTo<List<SystemConfigDisplayDto>>() };
    }

    [Authorization(subscription: true)]
    [HttpGet]
    public ResultApi<SystemConfigDisplayDto> Get([FromQuery] long systemConfig)
    {
        return new ResultApi<SystemConfigDisplayDto> { Result = systemConfigService.Get(systemConfig).MapTo<SystemConfigDisplayDto>() };
    }

    [Authorization(subscription: true)]
    [HttpGet]
    public ResultApi<SystemConfigDisplayDto> GetByKey([FromQuery] string key)
    {
        return new ResultApi<SystemConfigDisplayDto> { Result = systemConfigService.GetByKey(key).MapTo<SystemConfigDisplayDto>() };
    }

    [Authorization(admin: true)]
    [HttpPut]
    public ResultApi<bool> Update([FromBody] SystemConfigUpdateDto dto)
    {
        return new ResultApi<bool> { Result = systemConfigService.SetValue(dto.Key, dto.Value) };
    }
}
