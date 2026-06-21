using Finnance.Api.Modules.Common.Application.Interfaces;
using Finnance.Api.Modules.TransactionType.Domain.Entities;

namespace Finnance.Api.Modules.TransactionType.Application.Interfaces;

public interface ITransactionTypeService : IBaseService<TransactionTypeEntity>
{
    List<TransactionTypeEntity> List();

    TransactionTypeEntity Get(long transactionType);

    bool Exist(long transactionType);
}
