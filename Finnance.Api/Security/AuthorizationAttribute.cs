using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Filters;
using Finnance.Api.Modules.User.Application.Interfaces;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;
using System.Reflection;

namespace Finnance.Api.Security;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class AuthorizationAttribute(params long[] roles) : Attribute, IAuthorizationFilter
{
    public void OnAuthorization(AuthorizationFilterContext context)
    {
        var allowAnonymous = (context.ActionDescriptor as ControllerActionDescriptor).MethodInfo.GetCustomAttributes<AllowAnonymousAttribute>().Any();
        if (allowAnonymous) return;

        var (user, _, _) = context.HttpContext.GetUserLogged();
        if (user <= 0)
            throw new ApplicationException(Constants.ErrorMessage.ErrorAccess);

        if (roles.IsEmpty()) return;

        var userRoleService = context.HttpContext.RequestServices.GetService(typeof(IUserRoleService)) as IUserRoleService;
        var userRoles = userRoleService.GetRoleIds(user);
        if (!roles.Any(userRoles.Contains))
            throw new ApplicationException(Constants.ErrorMessage.ErrorAuthorization);
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
