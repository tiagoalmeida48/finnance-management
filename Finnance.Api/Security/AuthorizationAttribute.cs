using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Filters;
using Finnance.Api.Modules.Subscription.Application.Interfaces;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;
using System.Reflection;

namespace Finnance.Api.Security;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class AuthorizationAttribute(bool admin = false, bool subscription = false) : Attribute, IAuthorizationFilter
{
    public void OnAuthorization(AuthorizationFilterContext context)
    {
        var allowAnonymous = (context.ActionDescriptor as ControllerActionDescriptor).MethodInfo.GetCustomAttributes<AllowAnonymousAttribute>().Any();
        if (allowAnonymous) return;

        var (user, _, _) = context.HttpContext.GetUserLogged();
        if (user <= 0)
            throw new ApplicationException(Constants.ErrorMessage.ErrorAccess);

        if (admin && !context.HttpContext.IsAdminLogged())
            throw new ApplicationException(Constants.ErrorMessage.ErrorAuthorization);

        if (!subscription || context.HttpContext.IsAdminLogged()) return;

        var subscriptionService = context.HttpContext.RequestServices.GetService<ISubscriptionService>();
        if (subscriptionService == null || !subscriptionService.HasActiveAccess(user))
            throw new ApplicationException(Constants.ErrorMessage.SubscriptionRequired);
    }
}

public static class AccessExt
{
    public static (string schema, string token) GetToken(this HttpContext ctx)
    {
        var key = ctx.GetKeyHeader("Authorization");
        if (key.IsEmpty())
        {
            var cookie = ctx.Request.Cookies[Constants.CookieName];
            return cookie.IsEmpty() ? (string.Empty, string.Empty) : ("bearer", cookie);
        }

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

    public static bool IsAdminLogged(this HttpContext ctx)
    {
        var (_, token) = ctx.GetToken();
        if (token.IsEmpty()) return false;

        var principal = JwtHelper.ValidateToken(token, Finnance.Api.Shared.Utils.JwtConstants.SecretKey);
        return principal.FindFirst(JwtHelper.ClaimIsAdmin)?.Value == bool.TrueString;
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
