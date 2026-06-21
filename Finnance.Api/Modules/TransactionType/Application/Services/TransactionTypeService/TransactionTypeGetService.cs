using Finnance.Api.Modules.TransactionType.Domain.Entities;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.TransactionType.Application.Services;

public partial class TransactionTypeService
{
    public List<TransactionTypeEntity> List()
    {
        return transactionTypeRepository.Search(active: true);
    }

    public TransactionTypeEntity Get(long transactionType)
    {
        var current = transactionTypeRepository.Search(transactionType, active: true, quantity: 1).FirstOrDefault();
        if (current == null)
            throw new ApplicationException(Constants.ErrorMessage.TransactionTypeNotFound);

        return current;
    }

    public bool Exist(long transactionType)
    {
        return transactionTypeRepository.Search(transactionType, active: true, quantity: 1).FirstOrDefault() != null;
    }
}
