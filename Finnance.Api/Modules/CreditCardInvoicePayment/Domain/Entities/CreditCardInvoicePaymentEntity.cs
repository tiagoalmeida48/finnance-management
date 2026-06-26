using Finnance.Api.Modules.Common.Domain.Interfaces;
using Finnance.Api.Shared.BaseClass;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.CreditCardInvoicePayment.Domain.Entities;

public class CreditCardInvoicePaymentEntity : BaseEntity, IUserOwned
{
    public long CreditCardInvoicePayment { get; set; }

    public long User { get; set; }

    public long Invoice { get; set; }

    public long? Account { get; set; }

    public long? PaymentMethod { get; set; }

    public decimal Amount { get; set; }

    public DateTime PaidAt { get; set; }

    public string Notes { get; set; }

    public bool Active { get; set; }

    public override void ValidateCreate()
    {
        Active = true;

        if (User <= 0)
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);

        if (Invoice <= 0)
            throw new ApplicationException(Constants.ErrorMessage.InvoiceNotFound);

        if (Amount <= 0)
            throw new ApplicationException(Constants.ErrorMessage.InvalidAmount);

        if (PaidAt == default)
            PaidAt = DateTime.UtcNow;
    }

    public override void ValidateUpdate()
    {
        if (CreditCardInvoicePayment <= 0)
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);

        ValidateCreate();
    }
}
