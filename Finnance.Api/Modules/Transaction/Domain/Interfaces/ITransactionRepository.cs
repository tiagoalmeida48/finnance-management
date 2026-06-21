using Finnance.Api.Modules.Common.Domain.Interfaces;
using Finnance.Api.Modules.Transaction.Domain.Entities;

namespace Finnance.Api.Modules.Transaction.Domain.Interfaces;

public interface ITransactionRepository : IBaseRepository<TransactionEntity>
{
    List<TransactionEntity> Search(long transaction = 0,
                                   long user = 0,
                                   long account = 0,
                                   long category = 0,
                                   long card = 0,
                                   long installmentGroup = 0,
                                   long recurringGroup = 0,
                                   bool active = false,
                                   int quantity = 0);

    long Insert(TransactionEntity entity);

    bool UpdateTransaction(TransactionEntity entity);

    TransactionEntity GetById(long transaction, long user);

    List<TransactionEntity> GetByIds(List<long> ids, long user);

    List<TransactionEntity> GetPaginated(long user,
                                         long account,
                                         long category,
                                         DateTime? startDate,
                                         DateTime? endDate,
                                         bool? isPaid,
                                         bool sortAsc,
                                         int limit,
                                         int offset);

    (decimal Income, decimal Expense, decimal Pending) GetSummary(long user,
                                                                  long account,
                                                                  long category,
                                                                  DateTime? startDate,
                                                                  DateTime? endDate,
                                                                  bool? isPaid);

    void UpdateInvoiceLink(long transaction, long? invoice, long user);

    List<long> SearchInvoiceIdsByTransactions(List<long> ids, long user);

    List<long> SearchInvoiceIdsByGroup(long groupId, string groupColumn, long user);

    List<TransactionEntity> SearchByGroup(long groupId, string groupColumn, long user);

    bool DeleteById(long transaction, long user);

    int DeleteByGroup(long groupId, string groupColumn, long user);

    long? MaxGroupTotal(long installmentGroup, long user);

    void UpdateGroupTotal(long installmentGroup, int totalInstallments, long user);
}
