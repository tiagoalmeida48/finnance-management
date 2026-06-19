using Finnance.Api.Security;

namespace Finnance.Api;

public static partial class Configuration
{
    public static void ApplicationConfiguration(this WebApplication app, IConfiguration configuration)
    {
        app.UseExceptionHandler("/errors");

        app.UseRouting();

        app.UseCors(options =>
        {
            var allowedOrigins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>();
            var allowedHeaders = configuration.GetSection("Cors:AllowedHeaders").Get<string[]>();
            var allowedMethods = configuration.GetSection("Cors:AllowedMethods").Get<string[]>();

            options.WithOrigins(allowedOrigins).WithHeaders(allowedHeaders).WithMethods(allowedMethods);
        });

        app.UseDefaultFiles();

        app.UseStaticFiles();

        app.UseMiddleware<AuthorizationMiddleware>();

        SwaggerConfiguration(app);

        app.MapControllers();

        app.MapFallbackToFile("index.html");

        var connSeed = Shared.Utils.HashHelper.DecryptConnectionString(configuration.GetConnectionString("DefaultConnection"));
        try { Modules.User.Repository.RoleSeed.Run(connSeed); }
        catch { /* banco pode nao estar acessivel em dev; nao derruba o boot */ }

        // Stub: ISchedulerConfigService / IAttachmentConfigService do template foram
        // removidos na consolidacao. A inicializacao sera reimplementada em Finnance.Api/Modules.
    }
}