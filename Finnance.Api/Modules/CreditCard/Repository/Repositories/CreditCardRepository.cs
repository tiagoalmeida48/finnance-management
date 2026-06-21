using Dapper;
using Finnance.Api.Modules.Common.Repository;
using Finnance.Api.Modules.CreditCard.Application.Dto;
using Finnance.Api.Modules.CreditCard.Domain.Entities;
using Finnance.Api.Modules.CreditCard.Domain.Interfaces;
using Finnance.Api.Modules.CreditCard.Repository.Models;
using Finnance.Api.Shared.Utils;
using System.Text;

namespace Finnance.Api.Modules.CreditCard.Repository.Repositories;

public class CreditCardRepository : BaseRepository<CreditCardEntity, CreditCardMod>, ICreditCardRepository
{
    public List<CreditCardEntity> Search(long user = 0,
                                         long creditCard = 0,
                                         long bankAccount = 0,
                                         bool active = false,
                                         int quantity = 0)
    {
        var sb = new StringBuilder();
        var param = new DynamicParameters();

        sb.Append("SELECT * FROM credit_card WHERE 1 = 1 ");

        if (user > 0)
        {
            param.Add("user", user);
            sb.Append("""AND "user" = @user """);
        }

        if (creditCard > 0)
        {
            param.Add("creditCard", creditCard);
            sb.Append("AND credit_card = @creditCard ");
        }

        if (bankAccount > 0)
        {
            param.Add("bankAccount", bankAccount);
            sb.Append("AND bank_account = @bankAccount ");
        }

        if (active)
            sb.Append("AND active = TRUE ");

        if (quantity > 0)
        {
            param.Add("quantity", quantity);
            sb.Append("LIMIT @quantity");
        }

        using var con = Conn;
        var model = con.Query<CreditCardMod>(sb.ToString(), param).ToList();
        return MapToEntity(model);
    }

    public CreditCardStatsDto GetStats(long creditCard, long user)
    {
        const string sql = """
            SELECT
                cc.credit_card AS CreditCard,
                cc.credit_limit AS CreditLimit,
                COALESCE((
                    SELECT SUM(COALESCE(i.total_amount, 0) - COALESCE(i.paid_amount, 0))
                    FROM credit_card_invoice i
                    WHERE i.card = cc.credit_card
                      AND i.invoice_status <> @paidStatus
                ), 0) AS Usage,
                COALESCE((
                    SELECT COALESCE(i.total_amount, 0) - COALESCE(i.paid_amount, 0)
                    FROM credit_card_invoice i
                    WHERE i.card = cc.credit_card
                      AND i.month_key = to_char(CURRENT_DATE, 'YYYY-MM')
                    LIMIT 1
                ), 0) AS CurrentInvoice
            FROM credit_card cc
            WHERE cc.credit_card = @creditCard AND cc."user" = @user
            """;

        var param = new DynamicParameters();
        param.Add("creditCard", creditCard);
        param.Add("user", user);
        param.Add("paidStatus", Constants.InvoiceStatusId.PAID);

        using var con = Conn;
        var stats = con.QueryFirstOrDefault<CreditCardStatsDto>(sql, param);
        if (stats == null)
            return null;

        stats.AvailableLimit = stats.CreditLimit - stats.Usage;
        return stats;
    }

    public List<CreditCardStatsDto> GetAllStats(long user)
    {
        const string sql = """
            SELECT
                cc.credit_card AS CreditCard,
                cc.credit_limit AS CreditLimit,
                COALESCE((
                    SELECT SUM(COALESCE(i.total_amount, 0) - COALESCE(i.paid_amount, 0))
                    FROM credit_card_invoice i
                    WHERE i.card = cc.credit_card
                      AND i.invoice_status <> @paidStatus
                ), 0) AS Usage,
                COALESCE((
                    SELECT COALESCE(i.total_amount, 0) - COALESCE(i.paid_amount, 0)
                    FROM credit_card_invoice i
                    WHERE i.card = cc.credit_card
                      AND i.month_key = to_char(CURRENT_DATE, 'YYYY-MM')
                    LIMIT 1
                ), 0) AS CurrentInvoice
            FROM credit_card cc
            WHERE cc."user" = @user AND cc.active = TRUE
            """;

        var param = new DynamicParameters();
        param.Add("user", user);
        param.Add("paidStatus", Constants.InvoiceStatusId.PAID);

        using var con = Conn;
        var stats = con.Query<CreditCardStatsDto>(sql, param).ToList();
        foreach (var item in stats)
            item.AvailableLimit = item.CreditLimit - item.Usage;

        return stats;
    }
}
