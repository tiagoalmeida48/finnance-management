using Dapper;
using Finnance.Api.Modules.Common.Repository;
using Finnance.Api.Modules.Transaction.Domain.Entities;
using Finnance.Api.Modules.Transaction.Domain.Interfaces;
using Finnance.Api.Modules.Transaction.Repository.Models;

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
