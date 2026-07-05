namespace Finnance.Api.Modules.CreditCardInvoice.Application.Dto;

public class InvoiceListResultDto
{
    public List<CreditCardInvoiceDisplayDto> Items { get; set; }

    public int TotalCount { get; set; }

    public bool HasNextPage { get; set; }
}
