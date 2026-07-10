using Finnance.Api.Modules.Common.Application.Interfaces;
using Finnance.Api.Modules.Subscription.Domain.Entities;

namespace Finnance.Api.Modules.Subscription.Application.Interfaces;

public interface ISubscriptionService : IBaseService<SubscriptionEntity>
{
    SubscriptionEntity GetByUser(long userId);
    bool HasActiveAccess(long userId);
    List<SubscriptionEntity> ListAll(long subscriptionStatus = 0);
    string GetCheckoutUrl();
}
