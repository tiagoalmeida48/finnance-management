using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.OpenApi.Models;
using Finnance.Api.Security;
using Swashbuckle.AspNetCore.SwaggerUI;
using System.Globalization;
using System.Reflection;
using Path = System.IO.Path;

namespace Finnance.Api;

public static partial class Configuration
{
    public static void SwaggerConfiguration(this IServiceCollection services)
    {
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "WebApi - Base Project",
                Version = "v1"
            });

            c.TagActionsBy(api =>
            {
                if (api.ActionDescriptor is not ControllerActionDescriptor controllerActionDescriptor) return ["Others"];

                var groupName = controllerActionDescriptor.ControllerName;
                var groupAttr = controllerActionDescriptor.ControllerTypeInfo.GetCustomAttribute<AttributeBundler>(true);
                if (groupAttr != null)
                    return [$"{groupAttr.GroupOrder}) {groupName}"];

                return ["Others"];
            });

            c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
                Name = "Authorization",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.Http,
                Scheme = "bearer"
            });

            c.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        },
                        Scheme = "oauth2",
                        Name = "Bearer",
                        In = ParameterLocation.Header
                    },
                    new List<string>()
                }
            });

            var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
            var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
            c.IncludeXmlComments(xmlPath);
        });
    }

    public static void SwaggerConfiguration(WebApplication app)
    {
        app.UseSwagger(options => options.RouteTemplate = "openapi/{documentName}.json");

        app.UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/openapi/v1.json", "WebApi v1");
            c.DocExpansion(DocExpansion.None);
            c.InjectJavascript("/auth/js/auth-manager.js");
            c.InjectStylesheet("/auth/css/styles.css");
        });

        var supportedCultures = new[] { new CultureInfo("pt-BR"), new CultureInfo("en-US") };
        app.UseRequestLocalization(new RequestLocalizationOptions
        {
            DefaultRequestCulture = new RequestCulture(new CultureInfo("pt-BR")),
            SupportedCultures = supportedCultures,
            SupportedUICultures = supportedCultures
        });
    }
}