using Finnance.Api.Modules.Transaction.Application.Dto;
using Finnance.Api.Modules.Transaction.Domain.Entities;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.Transaction.Application.Services;

public partial class TransactionService
{
    public TransactionEntity GetById(long transaction, long userId)
    {
        var current = transactionRepository.GetById(transaction, userId);
        if (current == null)
            throw new ApplicationException(Constants.ErrorMessage.TransactionNotFound);

        return current;
    }

    public List<TransactionEntity> GetByIds(List<long> ids, long userId)
    {
        return transactionRepository.GetByIds(ids ?? [], userId);
    }

    public List<TransactionEntity> GetPaginated(TransactionFilterDto filter, long userId)
    {
        filter ??= new TransactionFilterDto();

        return transactionRepository.GetPaginated(userId,
                                                  filter.MapTo<TransactionQuery>(),
                                                  filter.SortAsc,
                                                  filter.SortField,
                                                  filter.Limit,
                                                  filter.Offset);
    }

    public TransactionSummaryDto GetSummary(TransactionFilterDto filter, long userId)
    {
        filter ??= new TransactionFilterDto();

        var totals = transactionRepository.GetSummary(userId, filter.MapTo<TransactionQuery>());

        return new TransactionSummaryDto
        {
            Income = totals.Income,
            Expense = totals.Expense,
            Pending = totals.Pending
        };
    }
}
