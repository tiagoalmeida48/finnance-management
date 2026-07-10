using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Finnance.Api.Modules.User.Application.Dto;
using Finnance.Api.Modules.User.Application.Interfaces;
using Finnance.Api.Security;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;
using Microsoft.AspNetCore.RateLimiting;

namespace Finnance.Api.Controllers;

[AllowAnonymous]
[RequestSizeLimit(16384)]
public class AuthController(IAuthService authService, IUserService userService) : ControllerBase
{
    [EnableRateLimiting("account-recovery")]
    [HttpPost]
    public ResultApi<bool> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        return new ResultApi<bool> { Result = userService.ForgotPassword(dto?.Email) };
    }

    [EnableRateLimiting("account-recovery")]
    [HttpPost]
    public ResultApi<bool> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        return new ResultApi<bool> { Result = userService.ResetPassword(dto?.Token, dto?.Password) };
    }

    [EnableRateLimiting("authentication")]
    [HttpPost]
    public ResultApi<SessionDto> Login([FromBody] LoginDto dto)
    {
        var session = authService.Login(dto?.Email, dto?.Password);
        return new ResultApi<SessionDto> { Result = session.MapTo<SessionDto>() };
    }

    [Authorization()]
    [HttpPost]
    public ResultApi<bool> Logout()
    {
        return new ResultApi<bool> { Result = userService.RevokeSessions(UserLogged.user) };
    }

    [Authorization()]
    [HttpGet]
    public ResultApi<MeDto> Me()
    {
        var me = authService.Me(UserLogged.user);
        return new ResultApi<MeDto> { Result = me };
    }
}
