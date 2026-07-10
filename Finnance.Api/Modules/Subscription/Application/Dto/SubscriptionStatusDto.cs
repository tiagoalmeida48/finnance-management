namespace Finnance.Api.Modules.Subscription.Application.Dto;

public class SubscriptionStatusDto
{
    public bool HasActiveAccess { get; set; }

    public long SubscriptionStatus { get; set; }

    public string PlanName { get; set; }

    public string PlanFrequency { get; set; }

    public DateTime? StartDate { get; set; }

    public DateTime? NextPayment { get; set; }

    public DateTime? EntitledUntil { get; set; }

    public string CheckoutUrl { get; set; }
}
