using Dapper;
using Finnance.Api.Modules.Common.Repository;
using Finnance.Api.Modules.CreditCardInvoice.Domain.Entities;
using Finnance.Api.Modules.CreditCardInvoice.Domain.Interfaces;
using Finnance.Api.Modules.CreditCardInvoice.Repository.Models;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;
using System.Text;

namespace Finnance.Api.Modules.CreditCardInvoice.Repository.Repositories;

public class CreditCardInvoiceRepository : BaseRepository<CreditCardInvoiceEntity, CreditCardInvoiceMod>, ICreditCardInvoiceRepository
{
    public List<CreditCardInvoiceEntity> Search(long creditCardInvoice = 0,
                                                long user = 0,
                                                long card = 0,
                                                string monthKey = null,
                                                bool active = false,
                                                int quantity = 0)
    {
        var sb = new StringBuilder();
        var param = new DynamicParameters();

        sb.Append("SELECT * FROM credit_card_invoice WHERE 1 = 1 ");

        if (creditCardInvoice > 0)
        {
            param.Add("credit_card_invoice", creditCardInvoice);
            sb.Append("AND credit_card_invoice = @credit_card_invoice ");
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

        if (monthKey.IsNotEmpty())
        {
            param.Add("month_key", monthKey);
            sb.Append("AND month_key = @month_key ");
        }

        if (active)
            sb.Append("AND active = TRUE ");

        sb.Append("ORDER BY month_key ");

        if (quantity > 0)
        {
            param.Add("quantity", quantity);
            sb.Append("LIMIT @quantity");
        }

        using var con = Conn;
        var model = con.Query<CreditCardInvoiceMod>(sb.ToString(), param).ToList();
        return MapToEntity(model);
    }

    public CreditCardInvoiceEntity SearchByCardMonth(long card, long user, string monthKey)
    {
        var param = new DynamicParameters();
        param.Add("card", card);
        param.Add("user", user);
        param.Add("month_key", monthKey);

        const string sql = """
                           SELECT * FROM credit_card_invoice
                           WHERE card = @card AND "user" = @user AND month_key = @month_key
                           LIMIT 1
                           """;

        using var con = Conn;
        var model = con.Query<CreditCardInvoiceMod>(sql, param).FirstOrDefault();
        return model == null ? null : MapToEntity(model);
    }

    public List<CreditCardInvoiceEntity> SearchByCardYear(long card, long user, int year)
    {
        var param = new DynamicParameters();
        param.Add("card", card);
        param.Add("user", user);
        param.Add("paid", Constants.InvoiceStatusId.PAID);

        var sb = new StringBuilder();
        sb.Append("SELECT ci.*, ");
        sb.Append("""(SELECT COUNT(*) FROM "transaction" t WHERE t.invoice = ci.credit_card_invoice AND t.active = TRUE) AS items_count """);
        sb.Append("FROM credit_card_invoice ci ");
        sb.Append("""WHERE ci.card = @card AND ci."user" = @user """);

        if (year > 0)
        {
            param.Add("year_prefix", year.ToString() + "-%");
            sb.Append("AND ci.month_key LIKE @year_prefix ");
        }

        sb.Append("ORDER BY CASE WHEN ci.invoice_status = @paid THEN 1 ELSE 0 END, ci.month_key DESC");

        using var con = Conn;
        var model = con.Query<CreditCardInvoiceMod>(sb.ToString(), param).ToList();
        return MapToEntity(model);
    }

    public List<CreditCardInvoiceEntity> SearchByYear(long user, int year)
    {
        var param = new DynamicParameters();
        param.Add("user", user);
        param.Add("paid", Constants.InvoiceStatusId.PAID);

        var sb = new StringBuilder();
        sb.Append("""SELECT * FROM credit_card_invoice WHERE "user" = @user """);

        if (year > 0)
        {
            param.Add("year_prefix", year.ToString() + "-%");
            sb.Append("AND month_key LIKE @year_prefix ");
        }

        sb.Append("ORDER BY CASE WHEN invoice_status = @paid THEN 1 ELSE 0 END, month_key");

        using var con = Conn;
        var model = con.Query<CreditCardInvoiceMod>(sb.ToString(), param).ToList();
        return MapToEntity(model);
    }

    public void UpdateTotals(long creditCardInvoice, long user, decimal totalAmount, decimal paidAmount, long invoiceStatus, DateTime? paidAt)
    {
        var param = new DynamicParameters();
        param.Add("credit_card_invoice", creditCardInvoice);
        param.Add("user", user);
        param.Add("total_amount", totalAmount);
        param.Add("paid_amount", paidAmount);
        param.Add("invoice_status", invoiceStatus);
        param.Add("paid_at", paidAt);

        const string sql = """
                           UPDATE credit_card_invoice
                           SET total_amount = @total_amount,
                               paid_amount = @paid_amount,
                               invoice_status = @invoice_status,
                               paid_at = @paid_at,
                               updated = NOW()
                           WHERE credit_card_invoice = @credit_card_invoice AND "user" = @user
                           """;

        using var con = Conn;
        con.Execute(sql, param);
    }

    public (decimal Total, decimal Paid) SumInvoiceAmounts(long invoice, long user)
    {
        var param = new DynamicParameters();
        param.Add("invoice", invoice);
        param.Add("user", user);
        param.Add("income", Constants.TransactionTypeId.INCOME);

        const string sql = """
                           SELECT
                               COALESCE(SUM(CASE WHEN transaction_type = @income THEN -amount ELSE amount END), 0) AS total,
                               COALESCE(SUM(CASE WHEN paid = TRUE AND transaction_type <> @income THEN amount ELSE 0 END), 0) AS paid
                           FROM "transaction"
                           WHERE invoice = @invoice AND "user" = @user AND active = TRUE
                           """;

        using var con = Conn;
        var row = con.QuerySingle<(decimal Total, decimal Paid)>(sql, param);
        return row;
    }

    public List<long> SearchTransactionIdsToReprocess(long card, long user, DateTime fromDate)
    {
        var param = new DynamicParameters();
        param.Add("card", card);
        param.Add("user", user);
        param.Add("from_date", fromDate.Date);

        const string sql = """
                           SELECT "transaction" FROM "transaction"
                           WHERE card = @card AND "user" = @user AND active = TRUE
                             AND (payment_date >= @from_date OR purchase_date >= @from_date)
                           ORDER BY "transaction"
                           """;

        using var con = Conn;
        return con.Query<long>(sql, param).ToList();
    }

    public (long Card, DateTime AnchorDate) ResolveTransactionAnchor(long transaction, long user)
    {
        var param = new DynamicParameters();
        param.Add("transaction", transaction);
        param.Add("user", user);

        const string sql = """
                           SELECT card, COALESCE(purchase_date, payment_date) AS anchor_date
                           FROM "transaction"
                           WHERE "transaction" = @transaction AND "user" = @user
                           LIMIT 1
                           """;

        using var con = Conn;
        return con.QuerySingle<(long Card, DateTime AnchorDate)>(sql, param);
    }

    public void UpdateTransactionInvoice(long transaction, long? invoice, long user)
    {
        var param = new DynamicParameters();
        param.Add("transaction", transaction);
        param.Add("invoice", invoice);
        param.Add("user", user);

        const string sql = """
                           UPDATE "transaction"
                           SET invoice = @invoice, updated = NOW()
                           WHERE "transaction" = @transaction AND "user" = @user
                           """;

        using var con = Conn;
        con.Execute(sql, param);
    }

    public List<long> SearchInvoiceIdsByCard(long card, long user)
    {
        var param = new DynamicParameters();
        param.Add("card", card);
        param.Add("user", user);

        const string sql = """SELECT credit_card_invoice FROM credit_card_invoice WHERE card = @card AND "user" = @user""";

        using var con = Conn;
        return con.Query<long>(sql, param).ToList();
    }

    public List<long> SearchReferencedInvoiceIds(long card, long user)
    {
        var param = new DynamicParameters();
        param.Add("card", card);
        param.Add("user", user);

        const string sql = """
                           SELECT DISTINCT invoice FROM "transaction"
                           WHERE card = @card AND "user" = @user AND invoice IS NOT NULL
                           """;

        using var con = Conn;
        return con.Query<long>(sql, param).ToList();
    }

    public void DeleteUnreferenced(long card, long user)
    {
        var param = new DynamicParameters();
        param.Add("card", card);
        param.Add("user", user);

        const string sql = """
                           DELETE FROM credit_card_invoice ci
                           WHERE ci.card = @card AND ci."user" = @user
                             AND NOT EXISTS (
                                 SELECT 1 FROM "transaction" t
                                 WHERE t.invoice = ci.credit_card_invoice
                             )
                           """;

        using var con = Conn;
        con.Execute(sql, param);
    }

    public int MarkOverdue(long user)
    {
        var param = new DynamicParameters();
        param.Add("user", user);
        param.Add("overdue", Constants.InvoiceStatusId.OVERDUE);
        param.Add("open", Constants.InvoiceStatusId.OPEN);
        param.Add("partial", Constants.InvoiceStatusId.PARTIAL);

        const string sql = """
                           UPDATE credit_card_invoice
                           SET invoice_status = @overdue, updated = NOW()
                           WHERE "user" = @user AND active = TRUE
                             AND due_date IS NOT NULL AND due_date < CURRENT_DATE
                             AND invoice_status IN (@open, @partial)
                             AND COALESCE(total_amount, 0) > COALESCE(paid_amount, 0)
                           """;

        using var con = Conn;
        return con.Execute(sql, param);
    }
}
