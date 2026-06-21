using Dapper;
using Finnance.Api.Modules.Common.Repository;
using Finnance.Api.Modules.BankAccount.Domain.Entities;
using Finnance.Api.Modules.BankAccount.Domain.Interfaces;
using Finnance.Api.Modules.BankAccount.Repository.Models;
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
        const string sql = """
            UPDATE bank_account
            SET current_balance = COALESCE(current_balance, 0) + @delta,
                updated = NOW()
            WHERE bank_account = @bankAccount AND "user" = @user
            """;

        var param = new DynamicParameters();
        param.Add("delta", delta);
        param.Add("bankAccount", bankAccount);
        param.Add("user", user);

        using var con = Conn;
        return con.Execute(sql, param) > 0;
    }
}
