using Dapper.Contrib.Extensions;
using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.Subscription.Repository.Models;

[Table("kiwify_webhook_event")]
public class KiwifyWebhookEventMod : BaseModel
{
    [Key]
    [Column("kiwify_webhook_event")]
    public long KiwifyWebhookEvent { get; set; }

    [Column("event_type")]
    public string EventType { get; set; }

    [Column("kiwify_order_id")]
    public string KiwifyOrderId { get; set; }

    [Column("kiwify_subscription_id")]
    public string KiwifySubscriptionId { get; set; }

    [Column("customer_email")]
    public string CustomerEmail { get; set; }

    [Column("payload", isJsonColumn: true)]
    public string Payload { get; set; }

    [Column("processed")]
    public bool Processed { get; set; }

    [Column("process_error")]
    public string ProcessError { get; set; }

    [Column("\"user\"")]
    public long? User { get; set; }
}
