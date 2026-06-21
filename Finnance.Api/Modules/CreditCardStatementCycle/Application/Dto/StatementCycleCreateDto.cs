namespace Finnance.Api.Modules.CreditCardStatementCycle.Application.Dto;

public class StatementCycleCreateDto
{
    public long Card { get; set; }

    public DateTime DateStart { get; set; }

    public short ClosingDay { get; set; }

    public short DueDay { get; set; }

    public string Notes { get; set; }
}
