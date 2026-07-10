namespace Finnance.Api.Modules.Subscription.Application.Dto;

public class KiwifyWebhookEventDisplayDto
{
    public long KiwifyWebhookEvent { get; set; }

    public string EventType { get; set; }

    public string KiwifyOrderId { get; set; }

    public string KiwifySubscriptionId { get; set; }

    public string CustomerEmail { get; set; }

    public bool Processed { get; set; }

    public string ProcessError { get; set; }

    public long? User { get; set; }

    public string ProductId { get; set; }

    public DateTime SourceEventAt { get; set; }

    public int ProcessAttempts { get; set; }

    public DateTime Created { get; set; }
}
