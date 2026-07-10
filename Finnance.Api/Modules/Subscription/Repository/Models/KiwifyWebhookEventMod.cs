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

    [Column("customer_name")]
    public string CustomerName { get; set; }

    [Column("customer_phone")]
    public string CustomerPhone { get; set; }

    [Column("order_status")]
    public string OrderStatus { get; set; }

    [Column("product_id")]
    public string ProductId { get; set; }

    [Column("product_name")]
    public string ProductName { get; set; }

    [Column("plan_name")]
    public string PlanName { get; set; }

    [Column("plan_frequency")]
    public string PlanFrequency { get; set; }

    [Column("charge_amount")]
    public decimal ChargeAmount { get; set; }

    [Column("start_date")]
    public DateTime? StartDate { get; set; }

    [Column("next_payment")]
    public DateTime? NextPayment { get; set; }

    [Column("source_event_at")]
    public DateTime SourceEventAt { get; set; }

    [Column("event_fingerprint")]
    public string EventFingerprint { get; set; }

    [Column("processed")]
    public bool Processed { get; set; }

    [Column("process_error")]
    public string ProcessError { get; set; }

    [Column("\"user\"")]
    public long? User { get; set; }

    [Column("process_attempts")]
    public int ProcessAttempts { get; set; }

    [Column("next_attempt_at")]
    public DateTime? NextAttemptAt { get; set; }

    [Column("processing_at")]
    public DateTime? ProcessingAt { get; set; }
}
