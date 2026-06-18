using Finnance.Api;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel(options =>
{
    options.AddServerHeader = false;
    options.AllowResponseHeaderCompression = false;
});
builder.WebHost.UseSetting(WebHostDefaults.SuppressStatusMessagesKey, "true");

builder.ConfigurationServices(builder.Configuration);

var app = builder.Build();

app.ApplicationConfiguration(builder.Configuration);

app.Run();