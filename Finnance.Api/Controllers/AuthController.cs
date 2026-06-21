using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Finnance.Api.Modules.User.Application.Dto;
using Finnance.Api.Modules.User.Application.Interfaces;
using Finnance.Api.Security;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Controllers;

[AllowAnonymous]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost]
    public ResultApi<SessionDto> Login([FromBody] LoginDto dto)
    {
        var session = authService.Login(dto?.Email, dto?.Password);

        Response.Cookies.Append(Constants.CookieName, session.Token, new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Lax,
            Path = "/",
            Expires = DateTimeOffset.UtcNow.AddHours(JwtConstants.ExpirationHours)
        });

        return new ResultApi<SessionDto> { Result = session.MapTo<SessionDto>() };
    }

    [HttpGet]
    public ResultApi<string> GetToken()
    {
        var token = Request.Cookies[Constants.CookieName] ?? string.Empty;
        return new ResultApi<string> { Result = token };
    }

    [HttpGet]
    public ResultApi<bool> Logout()
    {
        Response.Cookies.Delete(Constants.CookieName, new CookieOptions { Path = "/" });
        return new ResultApi<bool> { Result = true };
    }

    [Authorization()]
    [HttpGet]
    public ResultApi<MeDto> Me()
    {
        var me = authService.Me(UserLogged.user);
        return new ResultApi<MeDto> { Result = me };
    }
}
