using Finnance.Api.Modules.Common.Application.Services;
using Finnance.Api.Modules.Subscription.Application.Interfaces;
using Finnance.Api.Modules.Subscription.Domain.Entities;
using Finnance.Api.Modules.Subscription.Domain.Interfaces;

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
        return configuration["Kiwify:CheckoutUrl"] ?? string.Empty;
    }

    private int GraceDays()
    {
        return int.TryParse(configuration["Kiwify:GraceDays"], out var days) ? days : 3;
    }
}
