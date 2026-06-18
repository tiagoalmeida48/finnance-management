using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Filters;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;
using System.IdentityModel.Tokens.Jwt;
using System.Reflection;

namespace Finnance.Api.Security;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class AuthorizationAttribute(string authObject, string activity) : Attribute, IAuthorizationFilter
{
    public void OnAuthorization(AuthorizationFilterContext context)
    {
        // Stub: o servico de autenticacao do template foi removido na consolidacao.
        // A autorizacao por modulo sera reimplementada em Finnance.Api/Modules.
        _ = authObject;
        _ = activity;
        var allowAnonymous = (context.ActionDescriptor as ControllerActionDescriptor).MethodInfo.GetCustomAttributes<AllowAnonymousAttribute>().Any();
        if (allowAnonymous) return;
    }
}

public static class AccessExt
{
    public static (string schema, string token) GetToken(this HttpContext ctx)
    {
        var key = ctx.GetKeyHeader("Authorization");
        if (key.IsEmpty()) return (string.Empty, string.Empty);

        var keySpt = key.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (keySpt.Length > 1)
            return (keySpt[0], keySpt[1]);

        return ("bearer", keySpt[0]);
    }

    public static (long user, string language, string timeZone) GetUserLogged(this HttpContext ctx)
    {
        // Stub: IAuthenticationService foi removido na consolidacao.
        _ = ctx;
        return (0L, string.Empty, string.Empty);
    }

    public static (long user, string language, string timeZone) DecodeJwt(this HttpContext ctx, string token)
    {
        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);

        var userClaim = long.Parse(jwtToken.Claims.FirstOrDefault(c => c.Type == JwtHelper.NameIdentifier).Value);
        var langClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == JwtHelper.ClaimLang);
        var timeZoneClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == JwtHelper.ClaimTimeZone);

        return (userClaim, langClaim.Value, timeZoneClaim.Value);
    }

    private static string GetKeyHeader(this HttpContext ctx, string key)
    {
        if (!ctx.Request.Headers.TryGetValue(key, out var value)) return string.Empty;

        var newValue = value.FirstOrDefault();
        if (newValue.Contains("Basic")) return string.Empty;

        return newValue;
    }
}
