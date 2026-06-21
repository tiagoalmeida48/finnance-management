namespace Finnance.Api.Modules.CreditCard.Application.Dto;

public class CreditCardUpdateDto
{
    public long CreditCard { get; set; }

    public long BankAccount { get; set; }

    public string Name { get; set; }

    public string Color { get; set; }

    public decimal CreditLimit { get; set; }

    public string Notes { get; set; }

    public bool Active { get; set; }
}
