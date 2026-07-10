using Finnance.Api.Modules.Common.Application.Services;
using Finnance.Api.Modules.Subscription.Application.Interfaces;
using Finnance.Api.Modules.Subscription.Domain.Entities;
using Finnance.Api.Modules.Subscription.Domain.Interfaces;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.Subscription.Application.Services;

public partial class SubscriptionService(ISubscriptionRepository subscriptionRepository, IConfiguration configuration)
    : BaseService<SubscriptionEntity>(subscriptionRepository), ISubscriptionService
{
    public SubscriptionEntity GetByUser(long userId)
    {
        return subscriptionRepository.Search(user: userId, quantity: 1).FirstOrDefault();
    }

    public bool HasActiveAccess(long userId)
    {
        return subscriptionRepository.HasActiveAccess(userId, GraceDays());
    }

    public List<SubscriptionEntity> ListAll(long subscriptionStatus = 0)
    {
        return subscriptionRepository.Search(subscriptionStatus: subscriptionStatus);
    }

    public string GetCheckoutUrl()
    {
        return KiwifySettings.From(configuration).CheckoutUrl;
    }

    private int GraceDays()
    {
        return KiwifySettings.From(configuration).GraceDays;
    }
}
