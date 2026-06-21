using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Security;

public class AuthorizationMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value?.ToLower();
        if (path.StartsWith("/swagger"))
        {
            PreventCache(context);

            var isValid = ValidateToken(context, path);
            if (!isValid) return;

            await next(context);
            return;
        }

        await next(context);
    }

    public static bool ValidateToken(HttpContext context, string path)
    {
        var token = ExtractToken(context);

        if (token.IsNotEmpty() && IsTokenValid(token))
            return true;

        context.Response.Redirect($"/auth/login.html?returnUrl={Uri.EscapeDataString(path)}", false);
        return false;
    }

    private static string ExtractToken(HttpContext context)
    {
        var token = context.Request.Cookies[Constants.CookieName];
        if (token.IsNotEmpty()) return token;

        if (!context.Request.Headers.TryGetValue("Authorization", out var value))
            return string.Empty;

        var authHeader = value.ToString();
        if (authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            return authHeader.Substring("Bearer ".Length).Trim();

        if (authHeader.IsNotEmpty() && !authHeader.StartsWith("Basic"))
            return authHeader.Trim();

        return string.Empty;
    }

    private static bool IsTokenValid(string token)
    {
        try
        {
            JwtHelper.ValidateToken(token, JwtConstants.SecretKey);
            return true;
        }
        catch
        {
            return false;
        }
    }

    private static void PreventCache(HttpContext context)
    {
        context.Response.OnStarting(state =>
        {
            var response = ((HttpContext)state).Response;
            response.Headers.CacheControl = "no-store, no-cache, must-revalidate";
            response.Headers.Pragma = "no-cache";
            response.Headers.Expires = "0";
            return Task.CompletedTask;
        }, context);
    }
}
