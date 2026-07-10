using Dapper.Contrib.Extensions;
using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.Subscription.Repository.Models;

[Table("subscription")]
public class SubscriptionMod : BaseModel
{
    [Key]
    [Column("subscription")]
    public long Subscription { get; set; }

    [Column("\"user\"")]
    public long User { get; set; }

    [Column("subscription_status")]
    public long SubscriptionStatus { get; set; }

    [Column("kiwify_subscription_id")]
    public string KiwifySubscriptionId { get; set; }

    [Column("kiwify_order_id")]
    public string KiwifyOrderId { get; set; }

    [Column("kiwify_product_id")]
    public string KiwifyProductId { get; set; }

    [Column("kiwify_product_name")]
    public string KiwifyProductName { get; set; }

    [Column("customer_email")]
    public string CustomerEmail { get; set; }

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

    [Column("canceled_at")]
    public DateTime? CanceledAt { get; set; }

    [Column("last_event_at")]
    public DateTime? LastEventAt { get; set; }

    [Column("source_event_at")]
    public DateTime? SourceEventAt { get; set; }

    [Column("entitled_until")]
    public DateTime? EntitledUntil { get; set; }

    [Column("active")]
    public bool Active { get; set; }
}
