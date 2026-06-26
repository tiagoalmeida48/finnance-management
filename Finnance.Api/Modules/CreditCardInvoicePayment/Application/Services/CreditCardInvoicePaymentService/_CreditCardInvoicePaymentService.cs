using Finnance.Api.Modules.BankAccount.Application.Interfaces;
using Finnance.Api.Modules.Common.Application.Services;
using Finnance.Api.Modules.CreditCardInvoice.Application.Interfaces;
using Finnance.Api.Modules.CreditCardInvoicePayment.Application.Interfaces;
using Finnance.Api.Modules.CreditCardInvoicePayment.Domain.Entities;
using Finnance.Api.Modules.CreditCardInvoicePayment.Domain.Interfaces;

namespace Finnance.Api.Modules.CreditCardInvoicePayment.Application.Services;

public partial class CreditCardInvoicePaymentService(
    ICreditCardInvoicePaymentRepository creditCardInvoicePaymentRepository,
    ICreditCardInvoiceService creditCardInvoiceService,
    IBankAccountService bankAccountService)
    : BaseService<CreditCardInvoicePaymentEntity>(creditCardInvoicePaymentRepository), ICreditCardInvoicePaymentService
{
    public long RegisterPayment(CreditCardInvoicePaymentEntity entity, long userId)
    {
        creditCardInvoiceService.GetInvoice(entity.Invoice, userId);

        if (entity.Account is > 0)
            bankAccountService.Get(entity.Account.Value, userId);

        entity.User = userId;
        entity.ValidateCreate();

        using var tran = GetTransaction();
        var id = creditCardInvoicePaymentRepository.Create(entity);
        creditCardInvoiceService.RecalculateInvoiceTotal(entity.Invoice, userId);
        tran.Complete();

        return id;
    }

    public bool Delete(long creditCardInvoicePayment, long userId)
    {
        var current = GetOwned(creditCardInvoicePayment, userId);

        using var tran = GetTransaction();
        var deleted = creditCardInvoicePaymentRepository.Delete(current);
        creditCardInvoiceService.RecalculateInvoiceTotal(current.Invoice, userId);
        tran.Complete();

        return deleted;
    }
}
