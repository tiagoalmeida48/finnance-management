using Finnance.Api.Shared.BaseClass;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.Subscription.Domain.Entities;

public class KiwifyWebhookEventEntity : BaseEntity
{
    public long KiwifyWebhookEvent { get; set; }

    public string EventType { get; set; }

    public string KiwifyOrderId { get; set; }

    public string KiwifySubscriptionId { get; set; }

    public string CustomerEmail { get; set; }

    public string CustomerName { get; set; }

    public string CustomerPhone { get; set; }

    public string OrderStatus { get; set; }

    public string ProductId { get; set; }

    public string ProductName { get; set; }

    public string PlanName { get; set; }

    public string PlanFrequency { get; set; }

    public decimal ChargeAmount { get; set; }

    public DateTime? StartDate { get; set; }

    public DateTime? NextPayment { get; set; }

    public DateTime SourceEventAt { get; set; }

    public string EventFingerprint { get; set; }

    public bool Processed { get; set; }

    public string ProcessError { get; set; }

    public long? User { get; set; }

    public int ProcessAttempts { get; set; }

    public DateTime? NextAttemptAt { get; set; }

    public DateTime? ProcessingAt { get; set; }

    public override void ValidateCreate()
    {
        if (string.IsNullOrWhiteSpace(EventFingerprint) || string.IsNullOrWhiteSpace(EventType) || SourceEventAt == default)
            throw new ApplicationException(Constants.ErrorMessage.InvalidWebhookPayload);
    }
}
