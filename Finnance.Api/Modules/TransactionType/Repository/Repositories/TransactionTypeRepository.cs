using Dapper;
using Finnance.Api.Modules.Common.Repository;
using Finnance.Api.Modules.TransactionType.Domain.Entities;
using Finnance.Api.Modules.TransactionType.Domain.Interfaces;
using Finnance.Api.Modules.TransactionType.Repository.Models;
using Finnance.Api.Shared;
using System.Text;

namespace Finnance.Api.Modules.TransactionType.Repository.Repositories;

public class TransactionTypeRepository : BaseRepository<TransactionTypeEntity, TransactionTypeMod>, ITransactionTypeRepository
{
    public List<TransactionTypeEntity> Search(long transactionType = 0,
                                              string name = null,
                                              bool active = false,
                                              int quantity = 0)
    {
        var sb = new StringBuilder();
        var param = new DynamicParameters();

        sb.Append("SELECT * FROM transaction_type WHERE 1 = 1 ");

        if (transactionType > 0)
        {
            param.Add("transactionType", transactionType);
            sb.Append("AND transaction_type = @transactionType ");
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
        var model = con.Query<TransactionTypeMod>(sb.ToString(), param).ToList();
        return MapToEntity(model);
    }
}
