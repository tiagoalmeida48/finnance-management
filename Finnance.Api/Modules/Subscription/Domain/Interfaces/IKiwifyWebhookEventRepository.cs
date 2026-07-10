using Finnance.Api.Modules.Common.Domain.Interfaces;
using Finnance.Api.Modules.Subscription.Domain.Entities;

namespace Finnance.Api.Modules.Subscription.Domain.Interfaces;

public interface IKiwifyWebhookEventRepository : IBaseRepository<KiwifyWebhookEventEntity>
{
    List<KiwifyWebhookEventEntity> Search(long kiwifyWebhookEvent = 0,
                                          bool onlyUnprocessed = false,
                                          string customerEmail = null,
                                          int quantity = 0);
}
