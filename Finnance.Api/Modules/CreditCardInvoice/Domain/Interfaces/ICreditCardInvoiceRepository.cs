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

    CreditCardInvoiceEntity SearchByCardMonth(long card, string monthKey);

    List<CreditCardInvoiceEntity> SearchByCardYear(long card, long user, int year);

    void UpdateTotals(long creditCardInvoice, decimal totalAmount, decimal paidAmount, long invoiceStatus, DateTime? paidAt);

    (decimal Total, decimal Paid) SumInvoiceAmounts(long invoice);

    List<long> SearchTransactionIdsToReprocess(long card, DateTime fromDate);

    (long Card, DateTime AnchorDate) ResolveTransactionAnchor(long transaction);

    void UpdateTransactionInvoice(long transaction, long? invoice);

    List<long> SearchInvoiceIdsByCard(long card);

    List<long> SearchReferencedInvoiceIds(long card);

    void DeleteUnreferenced(long card);
}
