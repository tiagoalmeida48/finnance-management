using Dapper;
using Finnance.Api.Modules.Common.Repository;
using Finnance.Api.Modules.Dashboard.Application.Dto;
using Finnance.Api.Modules.Dashboard.Domain.Entities;
using Finnance.Api.Modules.Dashboard.Domain.Interfaces;
using Finnance.Api.Modules.Dashboard.Repository.Models;
using Finnance.Api.Shared.Utils;
using System.Text;

namespace Finnance.Api.Modules.Dashboard.Repository.Repositories;

public class DashboardRepository : BaseRepository<DashboardEntity, DashboardMod>, IDashboardRepository
{
    public decimal GetTotalBalance(long user)
    {
        const string sql = """
            SELECT COALESCE(SUM(current_balance), 0)
            FROM bank_account
            WHERE "user" = @user AND active = TRUE
            """;

        var param = new DynamicParameters();
        param.Add("user", user);

        using var con = Conn;
        return con.ExecuteScalar<decimal>(sql, param);
    }

    public decimal GetTotalAvailableLimit(long user)
    {
        const string sql = """
            SELECT COALESCE(SUM(cc.credit_limit), 0)
                 - COALESCE((
                     SELECT SUM(COALESCE(i.total_amount, 0) - COALESCE(i.paid_amount, 0))
                     FROM credit_card_invoice i
                     INNER JOIN credit_card c ON c.credit_card = i.card AND c.active = TRUE
                     WHERE i."user" = @user
                       AND i.active = TRUE
                       AND i.invoice_status <> @paid
                   ), 0)
            FROM credit_card cc
            WHERE cc."user" = @user AND cc.active = TRUE
            """;

        var param = new DynamicParameters();
        param.Add("user", user);
        param.Add("paid", Constants.InvoiceStatusId.PAID);

        using var con = Conn;
        return con.ExecuteScalar<decimal>(sql, param);
    }

    public decimal GetMonthlyIncome(long user, DateTime? start, DateTime? end)
    {
        var sb = new StringBuilder();
        var param = new DynamicParameters();

        sb.Append("""
            SELECT COALESCE(SUM(amount), 0)
            FROM "transaction"
            WHERE "user" = @user AND paid = TRUE AND active = TRUE
            AND transaction_type = @income
            """);
        param.Add("user", user);
        param.Add("income", Constants.TransactionTypeId.INCOME);
        AppendPeriod(sb, param, start, end);

        using var con = Conn;
        return con.ExecuteScalar<decimal>(sb.ToString(), param);
    }

    public decimal GetMonthlyExpenses(long user, DateTime? start, DateTime? end)
    {
        var sb = new StringBuilder();
        var param = new DynamicParameters();

        sb.Append("""
            SELECT COALESCE(SUM(amount), 0)
            FROM "transaction"
            WHERE "user" = @user AND paid = TRUE AND active = TRUE
            AND transaction_type IN (@expense, @transfer)
            AND card IS NULL
            """);
        param.Add("user", user);
        param.Add("expense", Constants.TransactionTypeId.EXPENSE);
        param.Add("transfer", Constants.TransactionTypeId.TRANSFER);
        AppendPeriod(sb, param, start, end);

        using var con = Conn;
        return con.ExecuteScalar<decimal>(sb.ToString(), param);
    }

    public decimal GetInitialBalanceSum(long user)
    {
        const string sql = """
            SELECT COALESCE(SUM(initial_balance), 0)
            FROM bank_account
            WHERE "user" = @user AND active = TRUE
            """;

        var param = new DynamicParameters();
        param.Add("user", user);

        using var con = Conn;
        return con.ExecuteScalar<decimal>(sql, param);
    }

    public DateTime? GetFirstTransactionDate(long user)
    {
        const string sql = """
            SELECT MIN(payment_date)
            FROM "transaction"
            WHERE "user" = @user AND active = TRUE
            """;

        var param = new DynamicParameters();
        param.Add("user", user);

        using var con = Conn;
        return con.ExecuteScalar<DateTime?>(sql, param);
    }

    public List<ChartPointDto> GetChartData(long user, long card, DateTime? start, DateTime? end)
    {
        var sb = new StringBuilder();
        var param = new DynamicParameters();

        sb.Append("""
            SELECT to_char(payment_date, 'YYYY-MM') AS MonthKey,
                   COALESCE(SUM(CASE WHEN transaction_type = @income THEN amount ELSE 0 END), 0) AS Income,
                   COALESCE(SUM(CASE WHEN transaction_type IN (@expense, @transfer) AND card IS NULL THEN amount ELSE 0 END), 0) AS Expense
            FROM "transaction"
            WHERE "user" = @user AND paid = TRUE AND active = TRUE AND payment_date IS NOT NULL
            """);
        param.Add("user", user);
        param.Add("income", Constants.TransactionTypeId.INCOME);
        param.Add("expense", Constants.TransactionTypeId.EXPENSE);
        param.Add("transfer", Constants.TransactionTypeId.TRANSFER);

        if (card > 0)
        {
            param.Add("card", card);
            sb.Append("AND card = @card ");
        }

        AppendPeriod(sb, param, start, end);
        sb.Append("GROUP BY to_char(payment_date, 'YYYY-MM') ORDER BY MonthKey");

        using var con = Conn;
        return con.Query<ChartPointDto>(sb.ToString(), param).ToList();
    }

    public List<CategoryDistributionDto> GetCategoryDistribution(long user, DateTime? start, DateTime? end)
    {
        var sb = new StringBuilder();
        var param = new DynamicParameters();

        sb.Append("""
            SELECT COALESCE(c.name, 'Geral') AS CategoryName,
                   COALESCE(SUM(t.amount), 0) AS Total
            FROM "transaction" t
            LEFT JOIN category c ON c.category = t.category
            WHERE t."user" = @user AND t.paid = TRUE AND t.active = TRUE
            AND t.transaction_type = @expense
            """);
        param.Add("user", user);
        param.Add("expense", Constants.TransactionTypeId.EXPENSE);
        AppendPeriod(sb, param, start, end, "t.");
        sb.Append("GROUP BY COALESCE(c.name, 'Geral') ORDER BY Total DESC");

        using var con = Conn;
        return con.Query<CategoryDistributionDto>(sb.ToString(), param).ToList();
    }

    private static void AppendPeriod(StringBuilder sb, DynamicParameters param, DateTime? start, DateTime? end, string prefix = "")
    {
        if (start.HasValue)
        {
            param.Add("start", start.Value.Date);
            sb.Append($"AND {prefix}payment_date >= @start ");
        }

        if (end.HasValue)
        {
            param.Add("end", end.Value.Date);
            sb.Append($"AND {prefix}payment_date <= @end ");
        }
    }
}
