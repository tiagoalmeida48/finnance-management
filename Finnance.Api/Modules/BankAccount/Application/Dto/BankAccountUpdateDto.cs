namespace Finnance.Api.Modules.BankAccount.Application.Dto;

public class BankAccountUpdateDto
{
    public long BankAccount { get; set; }

    public string Name { get; set; }

    public long AccountType { get; set; }

    public string Color { get; set; }

    public string Icon { get; set; }

    public string Notes { get; set; }

    public bool Active { get; set; }
}
