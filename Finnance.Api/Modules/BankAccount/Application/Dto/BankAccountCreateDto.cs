namespace Finnance.Api.Modules.BankAccount.Application.Dto;

public class BankAccountCreateDto
{
    public string Name { get; set; }

    public long AccountType { get; set; }

    public decimal InitialBalance { get; set; }

    public string Color { get; set; }

    public string Icon { get; set; }

    public string Notes { get; set; }
}
