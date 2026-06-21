namespace Finnance.Api.Modules.CreditCardInvoice.Application.Dto;

public class CreditCardInvoiceDisplayDto
{
    public long CreditCardInvoice { get; set; }

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
}
