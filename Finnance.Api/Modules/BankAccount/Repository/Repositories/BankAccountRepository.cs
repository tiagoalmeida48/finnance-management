using Dapper;
using Finnance.Api.Modules.Common.Repository;
using Finnance.Api.Modules.BankAccount.Domain.Entities;
using Finnance.Api.Modules.BankAccount.Domain.Interfaces;
using Finnance.Api.Modules.BankAccount.Repository.Models;
using Finnance.Api.Shared.Utils;
using System.Text;

namespace Finnance.Api.Modules.BankAccount.Repository.Repositories;

public class BankAccountRepository : BaseRepository<BankAccountEntity, BankAccountMod>, IBankAccountRepository
{
    public List<BankAccountEntity> Search(long user = 0,
                                          long bankAccount = 0,
                                          long accountType = 0,
                                          bool active = false,
                                          int quantity = 0)
    {
        var sb = new StringBuilder();
        var param = new DynamicParameters();

        sb.Append("SELECT * FROM bank_account WHERE 1 = 1 ");
        sb.Append(GetTenantClause());
        TenantParams(param);

        if (user > 0)
        {
            param.Add("user", user);
            sb.Append("""AND "user" = @user """);
        }

        if (bankAccount > 0)
        {
            param.Add("bankAccount", bankAccount);
            sb.Append("AND bank_account = @bankAccount ");
        }

        if (accountType > 0)
        {
            param.Add("accountType", accountType);
            sb.Append("AND account_type = @accountType ");
        }

        if (active)
            sb.Append("AND active = TRUE ");

        if (quantity > 0)
        {
            param.Add("quantity", quantity);
            sb.Append("LIMIT @quantity");
        }

        using var con = Conn;
        var model = con.Query<BankAccountMod>(sb.ToString(), param).ToList();
        return MapToEntity(model);
    }

    public bool IncrementBalance(long bankAccount, decimal delta, long user)
    {
        var sql = $"""
            UPDATE bank_account
            SET current_balance = COALESCE(current_balance, 0) + @delta,
                updated = NOW()
            WHERE bank_account = @bankAccount AND "user" = @user{GetTenantClause()}
            """;

        var param = new DynamicParameters();
        param.Add("delta", delta);
        param.Add("bankAccount", bankAccount);
        param.Add("user", user);
        TenantParams(param);

        using var con = Conn;
        return con.Execute(sql, param) > 0;
    }

    public int ReconcileBalances(long user)
    {
        var param = new DynamicParameters();
        param.Add("user", user);
        param.Add("income", Constants.TransactionTypeId.INCOME);
        param.Add("transfer", Constants.TransactionTypeId.TRANSFER);
        TenantParams(param);

        var sql = $"""
            UPDATE bank_account ba
            SET current_balance = COALESCE(ba.initial_balance, 0)
                + COALESCE((
                    SELECT SUM(CASE WHEN t.transaction_type = @income THEN t.amount ELSE -t.amount END)
                    FROM "transaction" t
                    WHERE t.account = ba.bank_account AND t."user" = @user AND t.paid = TRUE AND t.card IS NULL AND t.active = TRUE{GetTenantClause("t")}
                ), 0)
                + COALESCE((
                    SELECT SUM(t.amount)
                    FROM "transaction" t
                    WHERE t.to_account = ba.bank_account AND t."user" = @user AND t.paid = TRUE AND t.transaction_type = @transfer AND t.active = TRUE{GetTenantClause("t")}
                ), 0),
                updated = NOW()
            WHERE ba."user" = @user AND ba.active = TRUE{GetTenantClause("ba")}
            """;

        using var con = Conn;
        return con.Execute(sql, param);
    }
}
