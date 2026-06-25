using Finnance.Api.Modules.Common.Application.Interfaces;
using Finnance.Api.Modules.CreditCardInvoice.Domain.Entities;

namespace Finnance.Api.Modules.CreditCardInvoice.Application.Interfaces;

public interface ICreditCardInvoiceService : IBaseService<CreditCardInvoiceEntity>
{
    List<CreditCardInvoiceEntity> GetByCard(long cardId, long userId, int year = 0);

    CreditCardInvoiceEntity GetByMonth(long cardId, string monthKey, long userId);

    CreditCardInvoiceEntity GetInvoice(long invoiceId, long userId);

    long? ResolveInvoiceForTransaction(long cardId, long userId, DateTime anchorDate);

    void RecalculateInvoiceTotal(long invoiceId);

    void RecalculateInvoiceOwned(long invoiceId, long userId);

    void ReprocessInvoicesForCard(long cardId, long userId, DateTime fromDate);

    bool UpdateCycleAndReprocess(long creditCardStatementCycle, long userId, short closingDay, short dueDay, string notes);

    bool DeleteCycleAndReprocess(long creditCardStatementCycle, long userId);

    long InsertCycleAndReprocess(long card, long userId, DateTime dateStart, short closingDay, short dueDay, string notes);

    bool UpdateCycleStartAndReprocess(long creditCardStatementCycle, long userId, DateTime dateStart);

    bool UpdateCycleEndAndReprocess(long creditCardStatementCycle, long userId, DateTime dateEnd);
}
