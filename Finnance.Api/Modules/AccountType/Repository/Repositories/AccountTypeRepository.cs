using Dapper;
using Finnance.Api.Modules.AccountType.Domain.Entities;
using Finnance.Api.Modules.AccountType.Domain.Interfaces;
using Finnance.Api.Modules.AccountType.Repository.Models;
using Finnance.Api.Modules.Common.Repository;
using Finnance.Api.Shared;
using System.Text;

namespace Finnance.Api.Modules.AccountType.Repository.Repositories;

public class AccountTypeRepository : BaseRepository<AccountTypeEntity, AccountTypeMod>, IAccountTypeRepository
{
    public List<AccountTypeEntity> Search(long accountType = 0,
                                          string name = null,
                                          bool active = false,
                                          int quantity = 0)
    {
        var sb = new StringBuilder();
        var param = new DynamicParameters();

        sb.Append("SELECT * FROM account_type WHERE 1 = 1 ");

        if (accountType > 0)
        {
            param.Add("accountType", accountType);
            sb.Append("AND account_type = @accountType ");
        }

        if (name.IsNotEmpty())
        {
            param.Add("name", name);
            sb.Append("AND name = @name ");
        }

        if (active)
            sb.Append("AND active = TRUE ");

        if (quantity > 0)
        {
            param.Add("quantity", quantity);
            sb.Append("LIMIT @quantity");
        }

        using var con = Conn;
        var model = con.Query<AccountTypeMod>(sb.ToString(), param).ToList();
        return MapToEntity(model);
    }
}
