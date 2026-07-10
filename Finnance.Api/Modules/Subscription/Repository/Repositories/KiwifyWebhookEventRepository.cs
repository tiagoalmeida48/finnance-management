using Dapper;
using Finnance.Api.Modules.Common.Repository;
using Finnance.Api.Modules.Subscription.Domain.Entities;
using Finnance.Api.Modules.Subscription.Domain.Interfaces;
using Finnance.Api.Modules.Subscription.Repository.Models;
using Finnance.Api.Shared;
using System.Text;

namespace Finnance.Api.Modules.Subscription.Repository.Repositories;

public class KiwifyWebhookEventRepository : BaseRepository<KiwifyWebhookEventEntity, KiwifyWebhookEventMod>, IKiwifyWebhookEventRepository
{
    public List<KiwifyWebhookEventEntity> Search(long kiwifyWebhookEvent = 0,
                                                 bool onlyUnprocessed = false,
                                                 string customerEmail = null,
                                                 int quantity = 0)
    {
        var sb = new StringBuilder();
        var param = new DynamicParameters();

        sb.Append("SELECT * FROM kiwify_webhook_event WHERE 1 = 1 ");

        if (kiwifyWebhookEvent > 0)
        {
            param.Add("kiwifyWebhookEvent", kiwifyWebhookEvent);
            sb.Append("AND kiwify_webhook_event = @kiwifyWebhookEvent ");
        }

        if (onlyUnprocessed)
            sb.Append("AND processed = FALSE ");

        if (!customerEmail.IsEmpty())
        {
            param.Add("customerEmail", customerEmail);
            sb.Append("AND LOWER(customer_email) = LOWER(@customerEmail) ");
        }

        sb.Append("ORDER BY kiwify_webhook_event DESC ");

        if (quantity > 0)
        {
            param.Add("quantity", quantity);
            sb.Append("LIMIT @quantity");
        }

        using var con = Conn;
        var model = con.Query<KiwifyWebhookEventMod>(sb.ToString(), param).ToList();
        return MapToEntity(model);
    }
}
