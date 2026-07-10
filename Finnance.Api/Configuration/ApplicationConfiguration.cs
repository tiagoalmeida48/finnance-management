using Finnance.Api.Security;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api;

public static partial class Configuration
{
    public static void ApplicationConfiguration(this WebApplication app, IConfiguration configuration)
    {
        app.UseMiddleware<SecurityHeadersMiddleware>();

        app.UseExceptionHandler("/errors");

        if (!app.Environment.IsDevelopment()) app.UseHsts();

        app.UseHttpsRedirection();

        configuration.SeedConfiguration();

        app.UseRouting();

        app.UseRateLimiter();

        app.UseCors(options =>
        {
            var allowedOrigins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>();
            var allowedHeaders = configuration.GetSection("Cors:AllowedHeaders").Get<string[]>();
            var allowedMethods = configuration.GetSection("Cors:AllowedMethods").Get<string[]>();

            if (allowedOrigins.IsEmpty() || allowedHeaders.IsEmpty() || allowedMethods.IsEmpty()
                || allowedOrigins.Any(origin => !Uri.TryCreate(origin, UriKind.Absolute, out var uri)
                                                || uri.Scheme != Uri.UriSchemeHttps))
                throw new InvalidOperationException(Constants.ErrorMessage.CorsConfigurationInvalid);

            options.WithOrigins(allowedOrigins).WithHeaders(allowedHeaders).WithMethods(allowedMethods);
        });

        app.UseDefaultFiles();

        app.UseStaticFiles();

        if (app.Environment.IsDevelopment()) SwaggerConfiguration(app);

        app.MapControllers();

        app.MapFallbackToFile("index.html");
    }
}
