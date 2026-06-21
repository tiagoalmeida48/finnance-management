namespace Finnance.Api.Modules.CreditCard.Application.Dto;

public class CreditCardStatsDto
{
    public long CreditCard { get; set; }

    public decimal CreditLimit { get; set; }

    public decimal Usage { get; set; }

    public decimal CurrentInvoice { get; set; }

    public decimal AvailableLimit { get; set; }
}
