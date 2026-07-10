namespace Finnance.Api.Security;

public sealed class SecurityHeadersMiddleware(RequestDelegate next, IWebHostEnvironment environment)
{
    public async Task InvokeAsync(HttpContext context)
    {
        context.Response.OnStarting(() =>
        {
            var headers = context.Response.Headers;
            headers.XContentTypeOptions = "nosniff";
            headers.XFrameOptions = "DENY";
            headers.Append("Referrer-Policy", "no-referrer");
            headers.Append("Permissions-Policy", "camera=(), geolocation=(), microphone=(), payment=(), usb=()");
            headers.Append("Cross-Origin-Opener-Policy", "same-origin");

            if (context.Request.Path.StartsWithSegments("/api"))
            {
                headers.CacheControl = "no-store";
                headers.Pragma = "no-cache";
            }

            if (!environment.IsDevelopment()
                && !context.Request.Path.StartsWithSegments("/swagger")
                && !context.Request.Path.StartsWithSegments("/openapi")
                && !context.Request.Path.StartsWithSegments("/auth"))
            {
                headers.ContentSecurityPolicy = "default-src 'self'; base-uri 'self'; connect-src 'self'; font-src 'self' data: https://fonts.gstatic.com; form-action 'self'; frame-ancestors 'none'; img-src 'self' data:; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com";
            }

            return Task.CompletedTask;
        });

        await next(context);
    }
}
