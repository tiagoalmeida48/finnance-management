using Finnance.Api;
using Finnance.Api.Shared.Utils;

var builder = WebApplication.CreateBuilder(args);

JwtSettings.From(builder.Configuration);
KiwifySettings.From(builder.Configuration);

builder.WebHost.ConfigureKestrel(options =>
{
    options.AddServerHeader = false;
    options.AllowResponseHeaderCompression = false;
    options.Limits.MaxRequestBodySize = 1048576;
});
builder.WebHost.UseSetting(WebHostDefaults.SuppressStatusMessagesKey, "true");

builder.ConfigurationServices(builder.Configuration);

var app = builder.Build();

app.ApplicationConfiguration(builder.Configuration);

app.Run();
