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

    public string Payload { get; set; }

    public bool Processed { get; set; }

    public string ProcessError { get; set; }

    public long? User { get; set; }

    public override void ValidateCreate()
    {
        if (string.IsNullOrEmpty(Payload))
            throw new ApplicationException(Constants.ErrorMessage.InvalidWebhookPayload);
    }
}
