namespace Finnance.Api.Security;

public class SecurityHeadersMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        const string contentPolicy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/; object-src data:; " +
                                     "img-src 'self' data: blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; " +
                                     "connect-src 'self'; media-src 'self' data: blob:; frame-src data: https://www.google.com/; base-uri 'self'; form-action 'self'; frame-ancestors 'none';";
        
        context.Response.OnStarting(() =>
        {
            var headers = context.Response.Headers;

            if (context.Request.IsHttps)
                headers.StrictTransportSecurity = "max-age=31536000; includeSubDomains; preload";

            var isApiOrDoc = context.Request.Path.StartsWithSegments("/api") ||
                             context.Request.Path.StartsWithSegments("/swagger");
            
            if (isApiOrDoc)
            {
                headers.CacheControl = "no-store, no-cache, must-revalidate";
                headers.Remove("Pragma");
                headers.Remove("Expires");
            }
            else
            {
                if (!headers.ContainsKey("Cache-Control"))
                    headers.CacheControl = "public, max-age=31536000, immutable";
            }

            headers.ContentSecurityPolicy = contentPolicy;
            headers.XContentTypeOptions = "nosniff";
            headers.XFrameOptions = "DENY";
            headers.Date = string.Empty;
            headers["Referrer-Policy"] = "no-referrer";
            headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()";

            var isDocPath = context.Request.Path.StartsWithSegments("/swagger") ||
                            context.Request.Path.StartsWithSegments("/openapi");

            if (!context.Request.Path.StartsWithSegments("/api") && !isDocPath)
            {
                headers["Cross-Origin-Opener-Policy"] = "same-origin";
                headers["Cross-Origin-Embedder-Policy"] = "require-corp";
                headers["Cross-Origin-Resource-Policy"] = "same-origin";
            }
            
            headers.Remove("Server");
            headers.Remove("X-Powered-By");
            headers.Remove("X-AspNet-Version");
            headers.Remove("X-AspNetMvc-Version");
            headers.Remove("X-CDN-TraceID");
            headers.Remove("Last-Modified");

            return Task.CompletedTask;
        });

        if (context.Response.StatusCode >= 300 && context.Response.StatusCode < 400)
            context.Response.Body.SetLength(0);

        await next(context);
    }
}