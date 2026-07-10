using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using Finnance.Api.Modules.Common.Domain.Vo;
using Finnance.Api.Modules.Common.Repository;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;
using Finnance.Api.Security;
using Finnance.Api.Modules.Subscription.Application.Workers;
using System.Text.RegularExpressions;
using System.Threading.RateLimiting;

namespace Finnance.Api;

public static partial class Configuration
{
    public static void ConfigurationServices(this WebApplicationBuilder applicationBuilder, IConfiguration configuration)
    {
        JsonConvert.DefaultSettings = () => Extensions.JsonStt;

        TypeMapper.Initialize([".Repository.Models"], []);

        var strCon = configuration.GetConnectionString("DefaultConnection");
        var encryptionKey = configuration["ConnectionStrings:EncryptionKey"];
        var newStrCon = HashHelper.DecryptConnectionString(strCon, encryptionKey);

        var services = applicationBuilder.Services;

        services.AddControllersWithViews(options =>
            {
                options.Conventions.Add(new RouteTokenTransformerConvention(new SlugifyParameterTransformer()));
                options.Filters.Add<AuthorizationRequiredFilter>();
                options.Filters.Add<AuditActionFilter>();
            })
            .AddNewtonsoftJson(options =>
            {
                options.SerializerSettings.Formatting = Formatting.None;
                options.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
                options.SerializerSettings.NullValueHandling = NullValueHandling.Ignore;
                options.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
            });

        services.SwaggerConfiguration();

        services.AddCors();

        services.AddHsts(options =>
        {
            options.MaxAge = TimeSpan.FromDays(365);
            options.IncludeSubDomains = true;
            options.Preload = true;
        });

        services.AddHttpsRedirection(options =>
        {
            options.RedirectStatusCode = StatusCodes.Status308PermanentRedirect;
        });

        services.AddRateLimiter(options =>
        {
            options.AddPolicy("authentication", context =>
                RateLimitPartition.GetFixedWindowLimiter(
                    context.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
                    _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 5,
                        Window = TimeSpan.FromMinutes(1),
                        QueueLimit = 0
                    }));

            options.AddPolicy("account-recovery", context =>
                RateLimitPartition.GetFixedWindowLimiter(
                    context.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
                    _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 3,
                        Window = TimeSpan.FromMinutes(5),
                        QueueLimit = 0
                    }));

            options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(ctx =>
            {
                if (!ctx.Request.Path.StartsWithSegments("/api"))
                    return RateLimitPartition.GetNoLimiter("static");

                var isWebhook = ctx.Request.Path.StartsWithSegments("/api/kiwify-webhook");
                var partition = $"{ctx.Connection.RemoteIpAddress?.ToString() ?? "anon"}:{isWebhook}";
                return RateLimitPartition.GetFixedWindowLimiter(partition,
                                                                _ => new FixedWindowRateLimiterOptions
                                                                {
                                                                    PermitLimit = isWebhook ? 30 : 100,
                                                                    Window = TimeSpan.FromMinutes(1),
                                                                    QueueLimit = 0
                                                                });

            });

            options.OnRejected = async (context, token) =>
            {
                context.HttpContext.Response.StatusCode = 429;
                await context.HttpContext.Response.WriteAsJsonAsync(new ResultApi<object>
                {
                    Success = false,
                    Message = Constants.ErrorMessage.TooManyRequests
                }, token);
            };
        });

        services.Configure<FormOptions>(x =>
        {
            x.ValueLengthLimit = 1048576;
            x.MultipartBodyLengthLimit = 1048576;
            x.BufferBodyLengthLimit = 1048576;
        });

        services.AddHttpContextAccessor();
        services.AddTransient(provider =>
        {
            var apiContext = new ApiContextVo(newStrCon, Constants.None, Constants.LanguageDefault, Constants.TimeZoneDefault);
            var httpContextAccessor = provider.GetRequiredService<IHttpContextAccessor>();
            if (httpContextAccessor.HttpContext == null) return apiContext;

            var (_, token) = httpContextAccessor.HttpContext.GetToken();
            if (token.IsEmpty()) return apiContext;

            var (userId, language, timeZone) = httpContextAccessor.HttpContext.DecodeJwt(token);
            apiContext.User = userId;
            apiContext.Language = language;
            apiContext.TimeZone = timeZone;
            return apiContext;
        });

        services.DependencyInjectionConfiguration();
        if (KiwifySettings.From(configuration).Enabled)
            services.AddHostedService<KiwifyWebhookWorker>();
    }
}

public class SlugifyParameterTransformer : IOutboundParameterTransformer
{
    public string TransformOutbound(object value)
    {
        return value == null ? null : Regex.Replace(value.ToString() ?? string.Empty, "([a-z])([A-Z])", "$1-$2").ToLower();
    }

}
