using Finnance.Api.Modules.CreditCardInvoicePayment.Domain.Entities;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.CreditCardInvoicePayment.Application.Services;

public partial class CreditCardInvoicePaymentService
{
    private CreditCardInvoicePaymentEntity GetOwned(long creditCardInvoicePayment, long userId)
    {
        var current = Get(creditCardInvoicePayment, userId);
        if (current == null)
            throw new ApplicationException(Constants.ErrorMessage.InvoicePaymentNotFound);

        if (current.User != userId)
            throw new ApplicationException(Constants.ErrorMessage.AccessDeniedResource);

        return current;
    }
}
