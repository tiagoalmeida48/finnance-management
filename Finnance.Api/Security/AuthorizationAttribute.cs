using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Filters;
using Finnance.Api.Modules.Subscription.Application.Interfaces;
using Finnance.Api.Modules.User.Domain.Interfaces;
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

        var userRepository = context.HttpContext.RequestServices.GetRequiredService<IUserRepository>();
        var account = userRepository.Search(user: user, quantity: 1).FirstOrDefault();
        if (account == null || !account.Active || account.SubscriptionBlocked
            || account.TokenVersion != context.HttpContext.GetTokenVersion())
            throw new ApplicationException(Constants.ErrorMessage.ErrorAccess);

        if (admin && (!account.IsAdmin || !context.HttpContext.IsAdminLogged()))
            throw new ApplicationException(Constants.ErrorMessage.ErrorAuthorization);

        if (!subscription || account.IsAdmin) return;

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
        if (key.IsEmpty()) return (string.Empty, string.Empty);

        var keySpt = key.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (keySpt.Length == 2 && string.Equals(keySpt[0], "Bearer", StringComparison.OrdinalIgnoreCase))
            return ("bearer", keySpt[1]);

        return (string.Empty, string.Empty);
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

        var settings = JwtSettings.From(ctx.RequestServices.GetRequiredService<IConfiguration>());
        var principal = JwtHelper.ValidateToken(token, settings);
        return principal.FindFirst(JwtHelper.ClaimIsAdmin)?.Value == bool.TrueString;
    }

    public static (long user, string language, string timeZone) DecodeJwt(this HttpContext ctx, string token)
    {
        var settings = JwtSettings.From(ctx.RequestServices.GetRequiredService<IConfiguration>());
        var principal = JwtHelper.ValidateToken(token, settings);

        _ = long.TryParse(principal.FindFirst(JwtHelper.NameIdentifier)?.Value, out var userClaim);
        var langClaim = principal.FindFirst(JwtHelper.ClaimLang)?.Value ?? string.Empty;
        var timeZoneClaim = principal.FindFirst(JwtHelper.ClaimTimeZone)?.Value ?? string.Empty;

        return (userClaim, langClaim, timeZoneClaim);
    }

    public static int GetTokenVersion(this HttpContext ctx)
    {
        var (_, token) = ctx.GetToken();
        if (token.IsEmpty()) return -1;

        var settings = JwtSettings.From(ctx.RequestServices.GetRequiredService<IConfiguration>());
        var principal = JwtHelper.ValidateToken(token, settings);
        return int.TryParse(principal.FindFirst(JwtHelper.ClaimTokenVersion)?.Value, out var version) ? version : -1;
    }

    private static string GetKeyHeader(this HttpContext ctx, string key)
    {
        if (!ctx.Request.Headers.TryGetValue(key, out var value)) return string.Empty;

        var newValue = value.FirstOrDefault();
        return newValue;
    }
}
