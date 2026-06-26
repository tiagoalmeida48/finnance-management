using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using Finnance.Api.Modules.Common.Domain.Vo;
using Finnance.Api.Modules.Common.Repository;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;
using Finnance.Api.Security;
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
        var newStrCon = HashHelper.DecryptConnectionString(strCon);

        var services = applicationBuilder.Services;

        services.AddControllersWithViews(options =>
            {
                options.Conventions.Add(new RouteTokenTransformerConvention(new SlugifyParameterTransformer()));
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

        services.AddRateLimiter(options =>
        {
            options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(ctx =>
            {
                if (!ctx.Request.Path.StartsWithSegments("/api"))
                    return RateLimitPartition.GetNoLimiter("bypass");

                return RateLimitPartition.GetFixedWindowLimiter(ctx.Connection.RemoteIpAddress?.ToString() ?? "anon",
                                                                _ => new FixedWindowRateLimiterOptions
                                                                {
                                                                    PermitLimit = 100,
                                                                    Window = TimeSpan.FromMinutes(1),
                                                                    QueueLimit = 0
                                                                });

            });

            options.OnRejected = async (context, token) =>
            {
                context.HttpContext.Response.StatusCode = 429;
                await context.HttpContext.Response.WriteAsync("Too Many Requests", token);
            };
        });

        services.Configure<FormOptions>(x =>
        {
            x.ValueLengthLimit = int.MaxValue;
            x.MultipartBodyLengthLimit = long.MaxValue;
            x.BufferBodyLengthLimit = long.MaxValue;
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
    }
}

public class SlugifyParameterTransformer : IOutboundParameterTransformer
{
    public string TransformOutbound(object value)
    {
        return value == null ? null : Regex.Replace(value.ToString() ?? string.Empty, "([a-z])([A-Z])", "$1-$2").ToLower();
    }

    public class CustomHttpClientHandler : HttpClientHandler
    {
        public CustomHttpClientHandler()
        {
            ServerCertificateCustomValidationCallback = (message, cert, chain, sslPolicyErrors) => true;
        }
    }
}