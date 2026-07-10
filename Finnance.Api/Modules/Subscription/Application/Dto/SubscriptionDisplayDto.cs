namespace Finnance.Api.Modules.Subscription.Application.Dto;

public class SubscriptionDisplayDto
{
    public long Subscription { get; set; }

    public long User { get; set; }

    public long SubscriptionStatus { get; set; }

    public string KiwifySubscriptionId { get; set; }

    public string KiwifyOrderId { get; set; }

    public string KiwifyProductId { get; set; }

    public string KiwifyProductName { get; set; }

    public string CustomerEmail { get; set; }

    public string PlanName { get; set; }

    public string PlanFrequency { get; set; }

    public decimal ChargeAmount { get; set; }

    public DateTime? StartDate { get; set; }

    public DateTime? NextPayment { get; set; }

    public DateTime? CanceledAt { get; set; }

    public DateTime? LastEventAt { get; set; }

    public DateTime? SourceEventAt { get; set; }

    public DateTime? EntitledUntil { get; set; }

    public bool Active { get; set; }

    public DateTime Created { get; set; }

    public DateTime Updated { get; set; }
}
