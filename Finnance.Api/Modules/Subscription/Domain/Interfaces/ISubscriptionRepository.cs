using Finnance.Api.Modules.Common.Domain.Interfaces;
using Finnance.Api.Modules.Subscription.Domain.Entities;

namespace Finnance.Api.Modules.Subscription.Domain.Interfaces;

public interface ISubscriptionRepository : IBaseRepository<SubscriptionEntity>
{
    List<SubscriptionEntity> Search(long subscription = 0,
                                    long user = 0,
                                    string kiwifySubscriptionId = null,
                                    long subscriptionStatus = 0,
                                    int quantity = 0);

    bool HasActiveAccess(long user, int graceDays);
}
