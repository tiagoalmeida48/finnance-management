using Dapper;
using Finnance.Api.Modules.Common.Repository;
using Finnance.Api.Modules.CreditCardStatementCycle.Domain.Entities;
using Finnance.Api.Modules.CreditCardStatementCycle.Domain.Interfaces;
using Finnance.Api.Modules.CreditCardStatementCycle.Repository.Models;
using System.Text;

namespace Finnance.Api.Modules.CreditCardStatementCycle.Repository.Repositories;

public class CreditCardStatementCycleRepository : BaseRepository<CreditCardStatementCycleEntity, CreditCardStatementCycleMod>, ICreditCardStatementCycleRepository
{
    public List<CreditCardStatementCycleEntity> Search(long creditCardStatementCycle = 0,
                                                       long user = 0,
                                                       long card = 0,
                                                       bool active = false,
                                                       int quantity = 0)
    {
        var sb = new StringBuilder();
        var param = new DynamicParameters();

        sb.Append("SELECT * FROM credit_card_statement_cycle WHERE 1 = 1 ");

        if (creditCardStatementCycle > 0)
        {
            param.Add("credit_card_statement_cycle", creditCardStatementCycle);
            sb.Append("AND credit_card_statement_cycle = @credit_card_statement_cycle ");
        }

        if (user > 0)
        {
            param.Add("user", user);
            sb.Append("""AND "user" = @user """);
        }

        if (card > 0)
        {
            param.Add("card", card);
            sb.Append("AND card = @card ");
        }

        if (active)
            sb.Append("AND active = TRUE ");

        sb.Append("ORDER BY date_start ");

        if (quantity > 0)
        {
            param.Add("quantity", quantity);
            sb.Append("LIMIT @quantity");
        }

        using var con = Conn;
        var model = con.Query<CreditCardStatementCycleMod>(sb.ToString(), param).ToList();
        return MapToEntity(model);
    }

    public List<CreditCardStatementCycleEntity> SearchByCard(long card, long user)
    {
        return Search(card: card, user: user);
    }

    public CreditCardStatementCycleEntity SearchOpen(long card, long user)
    {
        var param = new DynamicParameters();
        param.Add("card", card);
        param.Add("user", user);

        const string sql = """
                           SELECT * FROM credit_card_statement_cycle
                           WHERE card = @card AND "user" = @user AND date_end = DATE '9999-12-31'
                           ORDER BY date_start DESC
                           LIMIT 1
                           """;

        using var con = Conn;
        var model = con.Query<CreditCardStatementCycleMod>(sql, param).FirstOrDefault();
        return model == null ? null : MapToEntity(model);
    }

    public CreditCardStatementCycleEntity SearchContaining(long card, long user, DateTime date)
    {
        var param = new DynamicParameters();
        param.Add("card", card);
        param.Add("user", user);
        param.Add("date", date.Date);

        const string sql = """
                           SELECT * FROM credit_card_statement_cycle
                           WHERE card = @card AND "user" = @user AND date_start <= @date AND date_end >= @date
                           ORDER BY date_start DESC
                           LIMIT 1
                           """;

        using var con = Conn;
        var model = con.Query<CreditCardStatementCycleMod>(sql, param).FirstOrDefault();
        return model == null ? null : MapToEntity(model);
    }
}
