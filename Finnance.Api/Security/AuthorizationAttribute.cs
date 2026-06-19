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
        var (_, token) = ctx.GetToken();
        if (token.IsEmpty()) return (0L, string.Empty, string.Empty);
        return ctx.DecodeJwt(token);
    }

    public static (long user, string language, string timeZone) DecodeJwt(this HttpContext ctx, string token)
    {
        // Valida assinatura/expiracao antes de extrair claims.
        var principal = JwtHelper.ValidateToken(token, Finnance.Api.Shared.Utils.JwtConstants.SecretKey);

        var userClaim = long.Parse(principal.FindFirst(JwtHelper.NameIdentifier)?.Value ?? "0");
        var langClaim = principal.FindFirst(JwtHelper.ClaimLang)?.Value ?? string.Empty;
        var timeZoneClaim = principal.FindFirst(JwtHelper.ClaimTimeZone)?.Value ?? string.Empty;

        return (userClaim, langClaim, timeZoneClaim);
    }

    private static string GetKeyHeader(this HttpContext ctx, string key)
    {
        if (!ctx.Request.Headers.TryGetValue(key, out var value)) return string.Empty;

        var newValue = value.FirstOrDefault();
        if (newValue.Contains("Basic")) return string.Empty;

        return newValue;
    }
}
