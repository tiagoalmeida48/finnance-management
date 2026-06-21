namespace Finnance.Api.Modules.CreditCardStatementCycle.Application.Dto;

public class StatementCycleDisplayDto
{
    public long CreditCardStatementCycle { get; set; }

    public long Card { get; set; }

    public DateTime DateStart { get; set; }

    public DateTime DateEnd { get; set; }

    public short ClosingDay { get; set; }

    public short DueDay { get; set; }

    public string Notes { get; set; }

    public bool Active { get; set; }

    public DateTime Created { get; set; }

    public DateTime Updated { get; set; }
}
