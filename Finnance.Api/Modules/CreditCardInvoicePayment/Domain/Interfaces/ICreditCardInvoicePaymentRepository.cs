using Finnance.Api.Modules.Common.Domain.Interfaces;
using Finnance.Api.Modules.CreditCardInvoicePayment.Domain.Entities;

namespace Finnance.Api.Modules.CreditCardInvoicePayment.Domain.Interfaces;

public interface ICreditCardInvoicePaymentRepository : IBaseRepository<CreditCardInvoicePaymentEntity>
{
    List<CreditCardInvoicePaymentEntity> Search(long creditCardInvoicePayment = 0, long user = 0, long invoice = 0, bool active = false, int quantity = 0);
}
