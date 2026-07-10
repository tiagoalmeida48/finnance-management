namespace Finnance.Api.Shared.Utils;

public sealed class KiwifySettings
{
    public bool Enabled { get; set; }

    public string WebhookToken { get; set; }

    public string CheckoutUrl { get; set; }

    public string ProductId { get; set; }

    public int GraceDays { get; set; }

    public int WorkerIntervalSeconds { get; set; }

    public int EventRetentionDays { get; set; }

    public static KiwifySettings From(IConfiguration configuration)
    {
        var settings = configuration.GetSection("Kiwify").Get<KiwifySettings>() ?? new KiwifySettings();
        if (!settings.Enabled) return settings;

        if (settings.WebhookToken.IsEmpty() || settings.ProductId.IsEmpty()
            || !Uri.TryCreate(settings.CheckoutUrl, UriKind.Absolute, out var checkoutUrl)
            || checkoutUrl.Scheme != Uri.UriSchemeHttps)
            throw new InvalidOperationException(Constants.ErrorMessage.KiwifyConfigurationInvalid);

        if (settings.GraceDays < 0 || settings.WorkerIntervalSeconds <= 0 || settings.EventRetentionDays <= 0)
            throw new InvalidOperationException(Constants.ErrorMessage.KiwifyConfigurationInvalid);

        return settings;
    }
}
