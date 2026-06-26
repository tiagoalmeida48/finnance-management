namespace Finnance.Api.Modules.CreditCardInvoicePayment.Application.Dto;

public class CreditCardInvoicePaymentDisplayDto
{
    public long CreditCardInvoicePayment { get; set; }

    public long Invoice { get; set; }

    public long? Account { get; set; }

    public long? PaymentMethod { get; set; }

    public decimal Amount { get; set; }

    public DateTime PaidAt { get; set; }

    public string Notes { get; set; }

    public bool Active { get; set; }
}
