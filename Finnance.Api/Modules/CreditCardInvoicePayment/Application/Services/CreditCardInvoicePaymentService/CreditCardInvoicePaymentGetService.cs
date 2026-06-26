using Finnance.Api.Modules.CreditCardInvoicePayment.Domain.Entities;

namespace Finnance.Api.Modules.CreditCardInvoicePayment.Application.Services;

public partial class CreditCardInvoicePaymentService
{
    public CreditCardInvoicePaymentEntity Get(long creditCardInvoicePayment, long userId)
    {
        return creditCardInvoicePaymentRepository.Search(creditCardInvoicePayment, userId, active: true, quantity: 1).FirstOrDefault();
    }

    public List<CreditCardInvoicePaymentEntity> ListByInvoice(long invoice, long userId)
    {
        return creditCardInvoicePaymentRepository.Search(user: userId, invoice: invoice, active: true);
    }
}
