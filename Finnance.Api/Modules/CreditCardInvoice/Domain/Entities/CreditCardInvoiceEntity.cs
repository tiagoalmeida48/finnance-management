using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;
using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.CreditCardInvoice.Domain.Entities;

public class CreditCardInvoiceEntity : BaseEntity
{
    public long CreditCardInvoice { get; set; }

    public long User { get; set; }

    public long Card { get; set; }

    public long InvoiceStatus { get; set; }

    public string MonthKey { get; set; }

    public DateTime? ClosingDate { get; set; }

    public DateTime? DueDate { get; set; }

    public decimal TotalAmount { get; set; }

    public decimal PaidAmount { get; set; }

    public DateTime? ClosedAt { get; set; }

    public DateTime? PaidAt { get; set; }

    public bool Active { get; set; }

    public override void ValidateCreate()
    {
        Active = true;

        if (User <= 0)
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);

        if (Card <= 0)
            throw new ApplicationException(Constants.ErrorMessage.CardNotFound);

        if (MonthKey.IsEmpty())
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);

        if (InvoiceStatus <= 0)
            InvoiceStatus = Constants.InvoiceStatusId.OPEN;
    }

    public override void ValidateUpdate()
    {
        if (CreditCardInvoice <= 0)
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);

        if (User <= 0)
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);
    }
}
