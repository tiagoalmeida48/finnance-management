namespace Finnance.Api.Modules.Subscription.Domain.Vo;

public class KiwifyEventVo
{
    public string EventType { get; set; }

    public string OrderId { get; set; }

    public string OrderStatus { get; set; }

    public string SubscriptionId { get; set; }

    public string ProductId { get; set; }

    public string ProductName { get; set; }

    public string CustomerEmail { get; set; }

    public string CustomerName { get; set; }

    public string PlanName { get; set; }

    public string PlanFrequency { get; set; }

    public decimal ChargeAmount { get; set; }

    public DateTime? StartDate { get; set; }

    public DateTime? NextPayment { get; set; }
}
