namespace Finnance.Api.Modules.CreditCard.Application.Dto;

public class CreditCardCreateDto
{
    public long BankAccount { get; set; }

    public string Name { get; set; }

    public string Color { get; set; }

    public decimal CreditLimit { get; set; }

    public string Notes { get; set; }
}
