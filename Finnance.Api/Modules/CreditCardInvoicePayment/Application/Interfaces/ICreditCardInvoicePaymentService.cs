using Finnance.Api.Modules.Common.Application.Interfaces;
using Finnance.Api.Modules.CreditCardInvoicePayment.Domain.Entities;

namespace Finnance.Api.Modules.CreditCardInvoicePayment.Application.Interfaces;

public interface ICreditCardInvoicePaymentService : IBaseService<CreditCardInvoicePaymentEntity>
{
    long RegisterPayment(CreditCardInvoicePaymentEntity entity, long userId);

    CreditCardInvoicePaymentEntity Get(long creditCardInvoicePayment, long userId);

    List<CreditCardInvoicePaymentEntity> ListByInvoice(long invoice, long userId);

    bool Delete(long creditCardInvoicePayment, long userId);
}
