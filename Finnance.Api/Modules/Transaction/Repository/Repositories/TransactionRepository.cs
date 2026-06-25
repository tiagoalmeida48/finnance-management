using Dapper;
using Finnance.Api.Modules.Common.Repository;
using Finnance.Api.Modules.Transaction.Domain.Entities;
using Finnance.Api.Modules.Transaction.Domain.Interfaces;
using Finnance.Api.Modules.Transaction.Repository.Models;
using Finnance.Api.Shared.Utils;
using System.Text;

namespace Finnance.Api.Modules.Transaction.Repository.Repositories;

public class TransactionRepository : BaseRepository<TransactionEntity, TransactionMod>, ITransactionRepository
{
    public List<TransactionEntity> Search(long transaction = 0,
                                          long user = 0,
                                          long account = 0,
                                          long category = 0,
                                          long card = 0,
                                          long installmentGroup = 0,
                                          long recurringGroup = 0,
                                          bool active = false,
                                          int quantity = 0)
    {
        var sb = new StringBuilder();
        var param = new DynamicParameters();

        sb.Append("""SELECT * FROM "transaction" WHERE 1 = 1 """);

        if (transaction > 0)
        {
            param.Add("transaction", transaction);
            sb.Append("""AND "transaction" = @transaction """);
        }

        if (user > 0)
        {
            param.Add("user", user);
            sb.Append("""AND "user" = @user """);
        }

        if (account > 0)
        {
            param.Add("account", account);
            sb.Append("AND account = @account ");
        }

        if (category > 0)
        {
            param.Add("category", category);
            sb.Append("AND category = @category ");
        }

        if (card > 0)
        {
            param.Add("card", card);
            sb.Append("AND card = @card ");
        }

        if (installmentGroup > 0)
        {
            param.Add("installmentGroup", installmentGroup);
            sb.Append("AND installment_group = @installmentGroup ");
        }

        if (recurringGroup > 0)
        {
            param.Add("recurringGroup", recurringGroup);
            sb.Append("AND recurring_group = @recurringGroup ");
        }

        if (active)
            sb.Append("AND active = TRUE ");

        sb.Append("ORDER BY payment_date DESC ");

        if (quantity > 0)
        {
            param.Add("quantity", quantity);
            sb.Append("LIMIT @quantity");
        }

        using var con = Conn;
        var model = con.Query<TransactionMod>(sb.ToString(), param).ToList();
        return MapToEntity(model);
    }

    public long Insert(TransactionEntity entity)
    {
        const string sql = """
            INSERT INTO "transaction"
                ("user", transaction_type, payment_method, amount, payment_date, purchase_date,
                 description, account, to_account, card, category, invoice, installment_group,
                 installment_number, recurring_group, fixed, paid, notes, active, created, updated)
            VALUES
                (@user, @transactionType, @paymentMethod, @amount, @paymentDate, @purchaseDate,
                 @description, @account, @toAccount, @card, @category, @invoice, @installmentGroup,
                 @installmentNumber, @recurringGroup, @fixed, @paid, @notes, @active, NOW(), NOW())
            RETURNING "transaction"
            """;

        using var con = Conn;
        return con.ExecuteScalar<long>(sql, BuildWriteParams(entity));
    }

    public bool UpdateTransaction(TransactionEntity entity)
    {
        const string sql = """
            UPDATE "transaction" SET
                transaction_type = @transactionType,
                payment_method = @paymentMethod,
                amount = @amount,
                payment_date = @paymentDate,
                purchase_date = @purchaseDate,
                description = @description,
                account = @account,
                to_account = @toAccount,
                card = @card,
                category = @category,
                invoice = @invoice,
                installment_group = @installmentGroup,
                installment_number = @installmentNumber,
                recurring_group = @recurringGroup,
                fixed = @fixed,
                paid = @paid,
                notes = @notes,
                active = @active,
                updated = NOW()
            WHERE "transaction" = @transaction AND "user" = @user
            """;

        var param = BuildWriteParams(entity);
        param.Add("transaction", entity.Transaction);

        using var con = Conn;
        return con.Execute(sql, param) > 0;
    }

    private static DynamicParameters BuildWriteParams(TransactionEntity entity)
    {
        var param = new DynamicParameters();
        param.Add("user", entity.User);
        param.Add("transactionType", entity.TransactionType);
        param.Add("paymentMethod", entity.PaymentMethod);
        param.Add("amount", entity.Amount);
        param.Add("paymentDate", entity.PaymentDate);
        param.Add("purchaseDate", entity.PurchaseDate);
        param.Add("description", entity.Description);
        param.Add("account", entity.Account);
        param.Add("toAccount", entity.ToAccount);
        param.Add("card", entity.Card);
        param.Add("category", entity.Category);
        param.Add("invoice", entity.Invoice);
        param.Add("installmentGroup", entity.InstallmentGroup);
        param.Add("installmentNumber", entity.InstallmentNumber);
        param.Add("recurringGroup", entity.RecurringGroup);
        param.Add("fixed", entity.Fixed);
        param.Add("paid", entity.Paid);
        param.Add("notes", entity.Notes);
        param.Add("active", entity.Active);
        return param;
    }

    public TransactionEntity GetById(long transaction, long user)
    {
        var param = new DynamicParameters();
        param.Add("transaction", transaction);
        param.Add("user", user);

        const string sql = """
            SELECT * FROM "transaction"
            WHERE "transaction" = @transaction AND "user" = @user
            LIMIT 1
            """;

        using var con = Conn;
        var model = con.Query<TransactionMod>(sql, param).FirstOrDefault();
        return model == null ? null : MapToEntity(model);
    }

    public List<TransactionEntity> GetByIds(List<long> ids, long user)
    {
        var param = new DynamicParameters();
        param.Add("ids", ids);
        param.Add("user", user);

        const string sql = """
            SELECT * FROM "transaction"
            WHERE "transaction" = ANY(@ids) AND "user" = @user
            ORDER BY payment_date DESC
            """;

        using var con = Conn;
        var model = con.Query<TransactionMod>(sql, param).ToList();
        return MapToEntity(model);
    }

    public List<TransactionEntity> GetPaginated(long user, TransactionQuery query, bool sortAsc, string sortField, int limit, int offset)
    {
        var sb = new StringBuilder();
        var param = new DynamicParameters();

        param.Add("user", user);
        sb.Append("""SELECT * FROM "transaction" WHERE "user" = @user AND active = TRUE """);

        AppendReadFilters(sb, param, query);

        sb.Append($"ORDER BY {ResolveSortColumn(sortField)} {(sortAsc ? "ASC" : "DESC")} ");

        param.Add("limit", limit <= 0 ? Constants.MaxPageSizeLimit : limit);
        param.Add("offset", offset < 0 ? 0 : offset);
        sb.Append("LIMIT @limit OFFSET @offset");

        using var con = Conn;
        var model = con.Query<TransactionMod>(sb.ToString(), param).ToList();
        return MapToEntity(model);
    }

    public (decimal Income, decimal Expense, decimal Pending) GetSummary(long user, TransactionQuery query)
    {
        var sb = new StringBuilder();
        var param = new DynamicParameters();

        param.Add("user", user);
        param.Add("income", Constants.TransactionTypeId.INCOME);
        param.Add("expense", Constants.TransactionTypeId.EXPENSE);
        param.Add("transfer", Constants.TransactionTypeId.TRANSFER);

        sb.Append("""
            SELECT
                COALESCE(SUM(CASE WHEN transaction_type = @income THEN amount ELSE 0 END), 0) AS income,
                COALESCE(SUM(CASE WHEN transaction_type IN (@expense, @transfer) THEN amount ELSE 0 END), 0) AS expense,
                COALESCE(SUM(CASE WHEN paid = FALSE THEN amount ELSE 0 END), 0) AS pending
            FROM "transaction"
            WHERE "user" = @user AND active = TRUE
            """);
        sb.Append(' ');

        AppendReadFilters(sb, param, query);

        using var con = Conn;
        var row = con.QuerySingle<TransactionSummaryMod>(sb.ToString(), param);
        return (row.Income, row.Expense, row.Pending);
    }

    private static readonly HashSet<string> SortableColumns = new(StringComparer.OrdinalIgnoreCase)
    {
        "payment_date", "purchase_date", "amount", "paid", "payment_method", "description", "transaction_type"
    };

    private static string ResolveSortColumn(string sortField)
    {
        return !string.IsNullOrWhiteSpace(sortField) && SortableColumns.Contains(sortField)
            ? sortField.ToLowerInvariant()
            : "payment_date";
    }

    private static void AppendReadFilters(StringBuilder sb, DynamicParameters param, TransactionQuery query)
    {
        if (query.Account > 0)
        {
            param.Add("account", query.Account);
            sb.Append("AND account = @account ");
        }

        if (query.Category > 0)
        {
            param.Add("category", query.Category);
            sb.Append("AND category = @category ");
        }

        if (query.Card > 0)
        {
            param.Add("card", query.Card);
            sb.Append("AND card = @card ");
        }

        if (query.Invoice > 0)
        {
            param.Add("invoice", query.Invoice);
            sb.Append("AND invoice = @invoice ");
        }

        if (query.TransactionType > 0)
        {
            param.Add("transactionType", query.TransactionType);
            sb.Append("AND transaction_type = @transactionType ");
        }

        if (query.PaymentMethod > 0)
        {
            param.Add("paymentMethod", query.PaymentMethod);
            sb.Append("AND payment_method = @paymentMethod ");
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            param.Add("search", $"%{query.Search.Trim()}%");
            sb.Append("AND description ILIKE @search ");
        }

        if (query.HideCreditCards)
            sb.Append("AND card IS NULL ");

        if (query.OnlyCreditCards)
            sb.Append("AND card IS NOT NULL ");

        if (query.OnlyInstallments)
            sb.Append("AND installment_group IS NOT NULL ");

        if (query.StartDate.HasValue)
        {
            param.Add("startDate", query.StartDate.Value.Date);
            sb.Append("AND payment_date >= @startDate ");
        }

        if (query.EndDate.HasValue)
        {
            param.Add("endDate", query.EndDate.Value.Date);
            sb.Append("AND payment_date <= @endDate ");
        }

        if (query.IsPaid.HasValue)
        {
            param.Add("isPaid", query.IsPaid.Value);
            sb.Append("AND paid = @isPaid ");
        }
    }

    public void UpdateInvoiceLink(long transaction, long? invoice, long user)
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

    public List<long> SearchInvoiceIdsByTransactions(List<long> ids, long user)
    {
        var param = new DynamicParameters();
        param.Add("ids", ids);
        param.Add("user", user);

        const string sql = """
            SELECT DISTINCT invoice FROM "transaction"
            WHERE "transaction" = ANY(@ids) AND "user" = @user AND invoice IS NOT NULL
            """;

        using var con = Conn;
        return con.Query<long>(sql, param).ToList();
    }

    public List<long> SearchUnpaidIdsByInvoice(long invoice, long user)
    {
        var param = new DynamicParameters();
        param.Add("invoice", invoice);
        param.Add("user", user);

        const string sql = """
            SELECT "transaction" FROM "transaction"
            WHERE invoice = @invoice AND "user" = @user AND active = TRUE AND paid = FALSE
            """;

        using var con = Conn;
        return con.Query<long>(sql, param).ToList();
    }

    public List<long> SearchInvoiceIdsByGroup(long groupId, string groupColumn, long user)
    {
        var param = new DynamicParameters();
        param.Add("groupId", groupId);
        param.Add("user", user);

        var sql = $"""
            SELECT DISTINCT invoice FROM "transaction"
            WHERE {groupColumn} = @groupId AND "user" = @user AND invoice IS NOT NULL
            """;

        using var con = Conn;
        return con.Query<long>(sql, param).ToList();
    }

    public List<TransactionEntity> SearchByGroup(long groupId, string groupColumn, long user)
    {
        var param = new DynamicParameters();
        param.Add("groupId", groupId);
        param.Add("user", user);

        var orderBy = groupColumn == "installment_group" ? "installment_number ASC" : "payment_date ASC";

        var sql = $"""
            SELECT * FROM "transaction"
            WHERE {groupColumn} = @groupId AND "user" = @user AND active = TRUE
            ORDER BY {orderBy}
            """;

        using var con = Conn;
        var model = con.Query<TransactionMod>(sql, param).ToList();
        return MapToEntity(model);
    }

    public bool DeleteById(long transaction, long user)
    {
        var param = new DynamicParameters();
        param.Add("transaction", transaction);
        param.Add("user", user);

        const string sql = """DELETE FROM "transaction" WHERE "transaction" = @transaction AND "user" = @user""";

        using var con = Conn;
        return con.Execute(sql, param) > 0;
    }

    public int DeleteByGroup(long groupId, string groupColumn, long user)
    {
        var param = new DynamicParameters();
        param.Add("groupId", groupId);
        param.Add("user", user);

        var sql = $"""DELETE FROM "transaction" WHERE {groupColumn} = @groupId AND "user" = @user""";

        using var con = Conn;
        return con.Execute(sql, param);
    }

    public long? MaxGroupTotal(long installmentGroup, long user)
    {
        var param = new DynamicParameters();
        param.Add("installmentGroup", installmentGroup);
        param.Add("user", user);

        const string sql = """
            SELECT MAX(GREATEST(COALESCE(t.installment_number, 0), COALESCE(g.total_installments, 0)))
            FROM "transaction" t
            JOIN installment_group g ON g.installment_group = t.installment_group
            WHERE t.installment_group = @installmentGroup AND t."user" = @user AND t.active = TRUE
            """;

        using var con = Conn;
        return con.ExecuteScalar<long?>(sql, param);
    }

    public void UpdateGroupTotal(long installmentGroup, int totalInstallments, long user)
    {
        var param = new DynamicParameters();
        param.Add("installmentGroup", installmentGroup);
        param.Add("totalInstallments", totalInstallments);
        param.Add("user", user);

        const string sql = """
            UPDATE installment_group
            SET total_installments = @totalInstallments, updated = NOW()
            WHERE installment_group = @installmentGroup AND "user" = @user
            """;

        using var con = Conn;
        con.Execute(sql, param);
    }
}
