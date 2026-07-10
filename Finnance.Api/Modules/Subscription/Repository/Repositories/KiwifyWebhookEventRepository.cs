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
    public long CreateIfAbsent(KiwifyWebhookEventEntity entity)
    {
        const string sql = """
            INSERT INTO kiwify_webhook_event
                (event_type, kiwify_order_id, kiwify_subscription_id, customer_email, customer_name, customer_phone,
                 order_status, product_id, product_name, plan_name, plan_frequency, charge_amount,
                 start_date, next_payment, source_event_at, event_fingerprint, processed,
                 process_attempts, next_attempt_at, created, updated)
            VALUES
                (@EventType, @KiwifyOrderId, @KiwifySubscriptionId, @CustomerEmail, @CustomerName, @CustomerPhone,
                 @OrderStatus, @ProductId, @ProductName, @PlanName, @PlanFrequency, @ChargeAmount,
                 @StartDate, @NextPayment, @SourceEventAt, @EventFingerprint, FALSE, 0, now(), now(), now())
            ON CONFLICT (event_fingerprint) DO UPDATE
            SET event_fingerprint = EXCLUDED.event_fingerprint
            RETURNING kiwify_webhook_event
            """;

        using var con = Conn;
        return con.ExecuteScalar<long>(sql, entity);
    }

    public List<KiwifyWebhookEventEntity> ClaimPending(int quantity)
    {
        const string sql = """
            WITH candidate AS (
                SELECT kiwify_webhook_event
                FROM kiwify_webhook_event
                WHERE processed = FALSE
                  AND COALESCE(next_attempt_at, now()) <= now()
                  AND (processing_at IS NULL OR processing_at < now() - interval '5 minutes')
                ORDER BY source_event_at, kiwify_webhook_event
                LIMIT @quantity
                FOR UPDATE SKIP LOCKED
            )
            UPDATE kiwify_webhook_event event
            SET processing_at = now(),
                process_attempts = event.process_attempts + 1,
                updated = now()
            FROM candidate
            WHERE event.kiwify_webhook_event = candidate.kiwify_webhook_event
            RETURNING event.*
            """;

        using var con = Conn;
        var models = con.Query<KiwifyWebhookEventMod>(sql, new { quantity }).ToList();
        return MapToEntity(models);
    }

    public bool Schedule(long kiwifyWebhookEvent)
    {
        const string sql = """
            UPDATE kiwify_webhook_event
            SET processed = FALSE, processing_at = NULL, next_attempt_at = now(), process_error = NULL, updated = now()
            WHERE kiwify_webhook_event = @kiwifyWebhookEvent
            """;

        using var con = Conn;
        return con.Execute(sql, new { kiwifyWebhookEvent }) > 0;
    }

    public int PurgeProcessed(int retentionDays)
    {
        const string sql = """
            DELETE FROM kiwify_webhook_event
            WHERE processed = TRUE
              AND updated < now() - make_interval(days => @retentionDays)
            """;

        using var con = Conn;
        return con.Execute(sql, new { retentionDays });
    }

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
