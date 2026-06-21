using Finnance.Api.Modules.Transaction.Domain.Entities;

namespace Finnance.Api.Modules.Transaction.Application.Services;

public partial class TransactionService
{
    private void LinkInvoice(long transactionId, TransactionEntity entity, long userId, HashSet<long> affected)
    {
        if (entity.Invoice is > 0)
            affected.Add(entity.Invoice.Value);

        if (entity.Card is null or <= 0)
        {
            if (entity.Invoice is > 0)
            {
                transactionRepository.UpdateInvoiceLink(transactionId, null, userId);
                entity.Invoice = null;
            }
            return;
        }

        var anchor = entity.PurchaseDate ?? entity.PaymentDate;
        if (anchor is null)
            return;

        var invoiceId = creditCardInvoiceService.ResolveInvoiceForTransaction(entity.Card.Value, userId, anchor.Value);

        transactionRepository.UpdateInvoiceLink(transactionId, invoiceId, userId);
        entity.Invoice = invoiceId;

        if (invoiceId is > 0)
            affected.Add(invoiceId.Value);
    }

    private void RecalcInvoices(HashSet<long> affected)
    {
        foreach (var invoiceId in affected)
            creditCardInvoiceService.RecalculateInvoiceTotal(invoiceId);
    }
}
