using Finnance.Api.Modules.Common.Application.Interfaces;
using Finnance.Api.Modules.Transaction.Application.Dto;
using Finnance.Api.Modules.Transaction.Domain.Entities;

namespace Finnance.Api.Modules.Transaction.Application.Interfaces;

public interface ITransactionService : IBaseService<TransactionEntity>
{
    (long Id, long? GroupId) CreateTransaction(TransactionCreateDto input, long userId);

    bool UpdateTransaction(TransactionUpdateDto patch, long userId);

    bool TogglePaid(long transaction, long userId);

    bool DeleteTransaction(long transaction, long userId);

    long Duplicate(long transaction, long userId);

    bool BatchPay(List<long> ids, long account, DateTime paymentDate, long userId);

    bool PayBill(long invoice, long account, DateTime paymentDate, long userId);

    bool BatchUnpay(List<long> ids, long userId);

    bool BatchDelete(List<long> ids, long userId);

    bool BatchChangeDay(List<long> ids, int day, long userId);

    long InsertInstallmentBetween(long transaction, long userId);

    bool DeleteGroup(long groupId, string type, long userId);

    List<long> UpdateGroup(UpdateGroupDto updates, long userId);

    TransactionEntity GetById(long transaction, long userId);

    List<TransactionEntity> GetByIds(List<long> ids, long userId);

    List<TransactionEntity> GetPaginated(TransactionFilterDto filter, long userId);

    TransactionListResultDto GetGroupedPaginated(TransactionFilterDto filter, long userId);

    TransactionSummaryDto GetSummary(TransactionFilterDto filter, long userId);

    string GetImportTemplate();
}
