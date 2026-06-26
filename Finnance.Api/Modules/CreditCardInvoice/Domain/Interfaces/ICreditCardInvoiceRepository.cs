using Finnance.Api.Modules.Common.Domain.Interfaces;
using Finnance.Api.Modules.CreditCardInvoice.Domain.Entities;

namespace Finnance.Api.Modules.CreditCardInvoice.Domain.Interfaces;

public interface ICreditCardInvoiceRepository : IBaseRepository<CreditCardInvoiceEntity>
{
    List<CreditCardInvoiceEntity> Search(long creditCardInvoice = 0,
                                         long user = 0,
                                         long card = 0,
                                         string monthKey = null,
                                         bool active = false,
                                         int quantity = 0);

    CreditCardInvoiceEntity SearchByCardMonth(long card, long user, string monthKey);

    List<CreditCardInvoiceEntity> SearchByCardYear(long card, long user, int year);

    void UpdateTotals(long creditCardInvoice, long user, decimal totalAmount, decimal paidAmount, long invoiceStatus, DateTime? paidAt);

    (decimal Total, decimal Paid) SumInvoiceAmounts(long invoice, long user);

    decimal SumPayments(long invoice, long user);

    List<long> SearchTransactionIdsToReprocess(long card, long user, DateTime fromDate);

    (long Card, DateTime AnchorDate) ResolveTransactionAnchor(long transaction, long user);

    void UpdateTransactionInvoice(long transaction, long? invoice, long user);

    List<long> SearchInvoiceIdsByCard(long card, long user);

    List<long> SearchReferencedInvoiceIds(long card, long user);

    void DeleteUnreferenced(long card, long user);

    int MarkOverdue(long user);
}
