using Finnance.Api.Modules.Common.Domain.Interfaces;
using Finnance.Api.Modules.TransactionType.Domain.Entities;

namespace Finnance.Api.Modules.TransactionType.Domain.Interfaces;

public interface ITransactionTypeRepository : IBaseRepository<TransactionTypeEntity>
{
    List<TransactionTypeEntity> Search(long transactionType = 0,
                                       string name = null,
                                       bool active = false,
                                       int quantity = 0);
}
