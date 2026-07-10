using Dapper;
using Finnance.Api.Modules.Common.Repository;
using Finnance.Api.Modules.Transaction.Domain.Entities;
using Finnance.Api.Modules.Transaction.Domain.Interfaces;
using Finnance.Api.Modules.Transaction.Repository.Models;
using Finnance.Api.Shared.Utils;
using System.Text;

namespace Finnance.Api.Modules.Transaction.Repository.Repositories;

public partial class TransactionRepository : BaseRepository<TransactionEntity, TransactionMod>, ITransactionRepository
{
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

    public List<long> InsertBatch(IReadOnlyList<TransactionEntity> entities)
    {
        if (entities.Count == 0)
            return [];

        var values = new StringBuilder();
        var param = new DynamicParameters();

        for (var i = 0; i < entities.Count; i++)
        {
            var entity = entities[i];

            if (i > 0)
                values.Append(',');

            values.Append($"(@user{i}, @transactionType{i}, @paymentMethod{i}, @amount{i}, @paymentDate{i}, @purchaseDate{i}, @description{i}, @account{i}, @toAccount{i}, @card{i}, @category{i}, @invoice{i}, @installmentGroup{i}, @installmentNumber{i}, @recurringGroup{i}, @fixed{i}, @paid{i}, @notes{i}, @active{i}, NOW(), NOW())");

            param.Add($"user{i}", entity.User);
            param.Add($"transactionType{i}", entity.TransactionType);
            param.Add($"paymentMethod{i}", entity.PaymentMethod);
            param.Add($"amount{i}", entity.Amount);
            param.Add($"paymentDate{i}", entity.PaymentDate);
            param.Add($"purchaseDate{i}", entity.PurchaseDate);
            param.Add($"description{i}", entity.Description);
            param.Add($"account{i}", entity.Account);
            param.Add($"toAccount{i}", entity.ToAccount);
            param.Add($"card{i}", entity.Card);
            param.Add($"category{i}", entity.Category);
            param.Add($"invoice{i}", entity.Invoice);
            param.Add($"installmentGroup{i}", entity.InstallmentGroup);
            param.Add($"installmentNumber{i}", entity.InstallmentNumber);
            param.Add($"recurringGroup{i}", entity.RecurringGroup);
            param.Add($"fixed{i}", entity.Fixed);
            param.Add($"paid{i}", entity.Paid);
            param.Add($"notes{i}", entity.Notes);
            param.Add($"active{i}", entity.Active);
        }

        var sql = $"""
            INSERT INTO "transaction"
                ("user", transaction_type, payment_method, amount, payment_date, purchase_date,
                 description, account, to_account, card, category, invoice, installment_group,
                 installment_number, recurring_group, fixed, paid, notes, active, created, updated)
            VALUES {values}
            RETURNING "transaction"
            """;

        using var con = Conn;
        return con.Query<long>(sql, param).ToList();
    }

    public bool UpdateTransaction(TransactionEntity entity)
    {
        var sql = $"""
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
            WHERE "transaction" = @transaction AND "user" = @user{GetTenantClause()}
            """;

        var param = BuildWriteParams(entity);
        param.Add("transaction", entity.Transaction);
        TenantParams(param);

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

    public void UpdateInvoiceLink(long transaction, long? invoice, long user)
    {
        var param = new DynamicParameters();
        param.Add("transaction", transaction);
        param.Add("invoice", invoice);
        param.Add("user", user);
        TenantParams(param);

        var sql = $"""
            UPDATE "transaction"
            SET invoice = @invoice, updated = NOW()
            WHERE "transaction" = @transaction AND "user" = @user{GetTenantClause()}
            """;

        using var con = Conn;
        con.Execute(sql, param);
    }

    public bool DeleteById(long transaction, long user)
    {
        var param = new DynamicParameters();
        param.Add("transaction", transaction);
        param.Add("user", user);
        TenantParams(param);

        var sql = $"""DELETE FROM "transaction" WHERE "transaction" = @transaction AND "user" = @user{GetTenantClause()}""";

        using var con = Conn;
        return con.Execute(sql, param) > 0;
    }

    public int DeleteByGroup(long groupId, string groupColumn, long user)
    {
        var param = new DynamicParameters();
        param.Add("groupId", groupId);
        param.Add("user", user);
        TenantParams(param);

        var sql = $"""DELETE FROM "transaction" WHERE {groupColumn} = @groupId AND "user" = @user{GetTenantClause()}""";

        using var con = Conn;
        return con.Execute(sql, param);
    }

    public List<long> SearchInvoiceIdsByGroup(long groupId, string groupColumn, long user)
    {
        var param = new DynamicParameters();
        param.Add("groupId", groupId);
        param.Add("user", user);
        TenantParams(param);

        var sql = $"""
            SELECT DISTINCT invoice FROM "transaction"
            WHERE {groupColumn} = @groupId AND "user" = @user AND invoice IS NOT NULL{GetTenantClause()}
            """;

        using var con = Conn;
        return con.Query<long>(sql, param).ToList();
    }

    public List<TransactionEntity> SearchByGroup(long groupId, string groupColumn, long user)
    {
        var param = new DynamicParameters();
        param.Add("groupId", groupId);
        param.Add("user", user);
        TenantParams(param);

        var orderBy = groupColumn == "installment_group" ? "installment_number ASC" : "payment_date ASC";

        var sql = $"""
            SELECT * FROM "transaction"
            WHERE {groupColumn} = @groupId AND "user" = @user AND active = TRUE{GetTenantClause()}
            ORDER BY {orderBy}
            """;

        using var con = Conn;
        var model = con.Query<TransactionMod>(sql, param).ToList();
        return MapToEntity(model);
    }

    public List<TransactionEntity> SearchByGroupFrom(long groupId, string groupColumn, DateTime fromDate, long user)
    {
        var param = new DynamicParameters();
        param.Add("groupId", groupId);
        param.Add("fromDate", fromDate.Date);
        param.Add("user", user);
        TenantParams(param);

        var orderBy = groupColumn == "installment_group" ? "installment_number ASC" : "payment_date ASC";

        var sql = $"""
            SELECT * FROM "transaction"
            WHERE {groupColumn} = @groupId AND "user" = @user AND active = TRUE AND payment_date >= @fromDate{GetTenantClause()}
            ORDER BY {orderBy}
            """;

        using var con = Conn;
        var model = con.Query<TransactionMod>(sql, param).ToList();
        return MapToEntity(model);
    }

    public List<TransactionEntity> SearchFixedExpensesByYear(int year, long user)
    {
        var param = new DynamicParameters();
        param.Add("user", user);
        param.Add("startDate", new DateTime(year, 1, 1));
        param.Add("endDate", new DateTime(year + 1, 1, 1));
        param.Add("expenseType", Constants.TransactionTypeId.EXPENSE);
        TenantParams(param);

        var sql = $"""
            SELECT * FROM "transaction"
            WHERE "user" = @user AND active = TRUE AND fixed = TRUE AND card IS NULL{GetTenantClause()}
              AND transaction_type = @expenseType
              AND payment_date >= @startDate AND payment_date < @endDate
            ORDER BY payment_date ASC
            """;

        using var con = Conn;
        var model = con.Query<TransactionMod>(sql, param).ToList();
        return MapToEntity(model);
    }

    public long? MaxGroupTotal(long installmentGroup, long user)
    {
        var param = new DynamicParameters();
        param.Add("installmentGroup", installmentGroup);
        param.Add("user", user);
        TenantParams(param);

        var sql = $"""
            SELECT MAX(GREATEST(COALESCE(t.installment_number, 0), COALESCE(g.total_installments, 0)))
            FROM "transaction" t
            JOIN installment_group g ON g.installment_group = t.installment_group{GetTenantClause("g")}
            WHERE t.installment_group = @installmentGroup AND t."user" = @user AND t.active = TRUE{GetTenantClause("t")}
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
        TenantParams(param);

        var sql = $"""
            UPDATE installment_group
            SET total_installments = @totalInstallments, updated = NOW()
            WHERE installment_group = @installmentGroup AND "user" = @user{GetTenantClause()}
            """;

        using var con = Conn;
        con.Execute(sql, param);
    }
}
