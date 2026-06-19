using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Finnance.Api.Modules.User.Application.Dto;
using Finnance.Api.Modules.User.Application.Interfaces;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Controllers;

public class AuthController(IAuthService authService) : ControllerBase
{
    [AllowAnonymous]
    [HttpPost]
    public ResultApi<SessionDto> Login([FromBody] LoginDto dto)
    {
        var session = authService.Login(dto?.Email, dto?.Password);
        return new ResultApi<SessionDto> { Result = session.MapTo<SessionDto>() };
    }

    [HttpGet]
    public ResultApi<MeDto> Me()
    {
        var me = authService.Me(UserLogged.user);
        return new ResultApi<MeDto> { Result = me };
    }
}
