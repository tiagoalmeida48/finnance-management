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
            var isValid = ValidateToken(context, path);
            if (!isValid) return;

            await next(context);
            return;
        }

        await next(context);
    }

    public static bool ValidateToken(HttpContext context, string path)
    {
        var token = context.Request.Cookies[Constants.CookieName];
        if (token.IsEmpty() && context.Request.Headers.TryGetValue("Authorization", out var value))
        {
            var authHeader = value.ToString();
            if (authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                token = authHeader.Substring("Bearer ".Length).Trim();
            }
            else if (authHeader.IsNotEmpty() && !authHeader.StartsWith("Basic"))
            {
                token = authHeader.Trim();
            }
        }

        if (token.IsNotEmpty())
            return true;

        context.Response.Redirect($"/auth/login.html?returnUrl={Uri.EscapeDataString(path)}", false);
        return false;
    }
}