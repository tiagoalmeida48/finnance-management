namespace Finnance.Api.Modules.BankAccount.Application.Dto;

public class BankAccountDisplayDto
{
    public long BankAccount { get; set; }

    public long AccountType { get; set; }

    public string Name { get; set; }

    public decimal InitialBalance { get; set; }

    public decimal CurrentBalance { get; set; }

    public string Color { get; set; }

    public string Icon { get; set; }

    public string Notes { get; set; }

    public bool Active { get; set; }

    public DateTime Created { get; set; }

    public DateTime Updated { get; set; }
}
