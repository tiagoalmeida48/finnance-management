using Finnance.Api.Modules.Common.Application.Interfaces;
using Finnance.Api.Modules.Subscription.Domain.Entities;

namespace Finnance.Api.Modules.Subscription.Application.Interfaces;

public interface IKiwifyWebhookService : IBaseService<KiwifyWebhookEventEntity>
{
    long ProcessWebhook(string rawBody, string signature);
    bool Reprocess(long kiwifyWebhookEvent);
    int ProcessPending(int quantity = 20);
    void RunMaintenance();
    List<KiwifyWebhookEventEntity> ListEvents(bool onlyUnprocessed = false, int quantity = 0);
}
