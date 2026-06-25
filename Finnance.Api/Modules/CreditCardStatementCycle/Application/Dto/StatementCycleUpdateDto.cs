namespace Finnance.Api.Modules.CreditCardStatementCycle.Application.Dto;

public class StatementCycleUpdateDto
{
    public long CreditCardStatementCycle { get; set; }

    public short ClosingDay { get; set; }

    public short DueDay { get; set; }

    public string Notes { get; set; }
}
