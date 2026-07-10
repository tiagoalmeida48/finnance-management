using Finnance.Api.Shared.BaseClass;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.Subscription.Domain.Entities;

public class SubscriptionEntity : BaseEntity
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

    public bool Active { get; set; }

    public override void ValidateCreate()
    {
        if (User <= 0)
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);

        if (SubscriptionStatus <= 0)
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);

        Active = true;
    }

    public override void ValidateUpdate()
    {
        if (Subscription <= 0)
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);

        if (User <= 0)
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);

        if (SubscriptionStatus <= 0)
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);
    }
}
