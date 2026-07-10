namespace Finnance.Api.Shared.Utils;

public sealed class JwtSettings
{
    public string SecretKey { get; set; }

    public string Issuer { get; set; }

    public string Audience { get; set; }

    public int ExpirationHours { get; set; }

    public static JwtSettings From(IConfiguration configuration)
    {
        var settings = configuration.GetSection("Jwt").Get<JwtSettings>() ?? new JwtSettings();
        settings.SecretKey ??= configuration["Jwt:Key"];
        if (settings.SecretKey.IsEmpty() || settings.SecretKey.Length < 64)
            throw new InvalidOperationException(Constants.ErrorMessage.JwtConfigurationInvalid);

        if (settings.Issuer.IsEmpty() || settings.Audience.IsEmpty()
                                      || settings.ExpirationHours <= 0 || settings.ExpirationHours > 24)
            throw new InvalidOperationException(Constants.ErrorMessage.JwtConfigurationInvalid);

        return settings;
    }
}
