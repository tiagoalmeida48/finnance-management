using Dapper;
using Finnance.Api.Modules.Common.Repository;
using Finnance.Api.Modules.RecurringRule.Domain.Entities;
using Finnance.Api.Modules.RecurringRule.Domain.Interfaces;
using Finnance.Api.Modules.RecurringRule.Repository.Models;
using System.Text;

namespace Finnance.Api.Modules.RecurringRule.Repository.Repositories;

public class RecurringRuleRepository : BaseRepository<RecurringRuleEntity, RecurringRuleMod>, IRecurringRuleRepository
{
    public List<RecurringRuleEntity> Search(long recurringRule = 0, long user = 0, bool active = false, int quantity = 0)
    {
        var sb = new StringBuilder();
        var param = new DynamicParameters();

        sb.Append("SELECT * FROM recurring_rule WHERE 1 = 1 ");

        if (recurringRule > 0)
        {
            param.Add("recurringRule", recurringRule);
            sb.Append("AND recurring_rule = @recurringRule ");
        }

        if (user > 0)
        {
            param.Add("user", user);
            sb.Append("""AND "user" = @user """);
        }

        if (active)
            sb.Append("AND active = TRUE ");

        sb.Append("ORDER BY date_start DESC ");

        if (quantity > 0)
        {
            param.Add("quantity", quantity);
            sb.Append("LIMIT @quantity");
        }

        using var con = Conn;
        var model = con.Query<RecurringRuleMod>(sb.ToString(), param).ToList();
        return MapToEntity(model);
    }

    public List<string> OccurrenceMonths(long recurringRule, long user)
    {
        var param = new DynamicParameters();
        param.Add("recurringRule", recurringRule);
        param.Add("user", user);

        const string sql = """
            SELECT DISTINCT to_char(payment_date, 'YYYY-MM')
            FROM "transaction"
            WHERE recurring_rule = @recurringRule AND "user" = @user AND active = TRUE AND payment_date IS NOT NULL
            """;

        using var con = Conn;
        return con.Query<string>(sql, param).ToList();
    }

    public void ClearOccurrences(long recurringRule, long user)
    {
        var param = new DynamicParameters();
        param.Add("recurringRule", recurringRule);
        param.Add("user", user);

        const string sql = """
            UPDATE "transaction" SET recurring_rule = NULL, updated = NOW()
            WHERE recurring_rule = @recurringRule AND "user" = @user
            """;

        using var con = Conn;
        con.Execute(sql, param);
    }
}
