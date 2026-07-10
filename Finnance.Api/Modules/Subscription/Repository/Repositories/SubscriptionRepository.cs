using Dapper;
using Finnance.Api.Modules.Common.Repository;
using Finnance.Api.Modules.Subscription.Domain.Entities;
using Finnance.Api.Modules.Subscription.Domain.Interfaces;
using Finnance.Api.Modules.Subscription.Repository.Models;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;
using System.Text;

namespace Finnance.Api.Modules.Subscription.Repository.Repositories;

public class SubscriptionRepository : BaseRepository<SubscriptionEntity, SubscriptionMod>, ISubscriptionRepository
{
    public List<SubscriptionEntity> Search(long subscription = 0,
                                           long user = 0,
                                           string kiwifySubscriptionId = null,
                                           long subscriptionStatus = 0,
                                           int quantity = 0)
    {
        var sb = new StringBuilder();
        var param = new DynamicParameters();

        sb.Append("SELECT * FROM subscription WHERE 1 = 1 ");

        if (subscription > 0)
        {
            param.Add("subscription", subscription);
            sb.Append("AND subscription = @subscription ");
        }

        if (user > 0)
        {
            param.Add("user", user);
            sb.Append("""AND "user" = @user """);
        }

        if (!kiwifySubscriptionId.IsEmpty())
        {
            param.Add("kiwifySubscriptionId", kiwifySubscriptionId);
            sb.Append("AND kiwify_subscription_id = @kiwifySubscriptionId ");
        }

        if (subscriptionStatus > 0)
        {
            param.Add("subscriptionStatus", subscriptionStatus);
            sb.Append("AND subscription_status = @subscriptionStatus ");
        }

        sb.Append("ORDER BY subscription DESC ");

        if (quantity > 0)
        {
            param.Add("quantity", quantity);
            sb.Append("LIMIT @quantity");
        }

        using var con = Conn;
        var model = con.Query<SubscriptionMod>(sb.ToString(), param).ToList();
        return MapToEntity(model);
    }

    public bool HasActiveAccess(long user, int graceDays)
    {
        const string sql = """
            SELECT EXISTS (
                SELECT 1
                FROM subscription s
                WHERE s."user" = @user
                  AND s.active = TRUE
                  AND (
                      s.subscription_status = @active
                      OR (s.subscription_status = @late
                          AND now() <= COALESCE(s.next_payment, s.last_event_at, s.updated) + make_interval(days => @graceDays))
                      OR (s.subscription_status = @canceled
                          AND s.next_payment IS NOT NULL
                          AND now() <= s.next_payment)
                  )
            )
            """;

        var param = new DynamicParameters();
        param.Add("user", user);
        param.Add("graceDays", graceDays);
        param.Add("active", Constants.SubscriptionStatusId.ACTIVE);
        param.Add("late", Constants.SubscriptionStatusId.LATE);
        param.Add("canceled", Constants.SubscriptionStatusId.CANCELED);

        using var con = Conn;
        return con.ExecuteScalar<bool>(sql, param);
    }
}
