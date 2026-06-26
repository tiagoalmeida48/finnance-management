namespace Finnance.Api.Modules.RecurringRule.Application.Dto;

public class RecurringRuleCreateDto
{
    public string Description { get; set; }

    public decimal Amount { get; set; }

    public long TransactionType { get; set; }

    public long? Category { get; set; }

    public long? Account { get; set; }

    public long? Card { get; set; }

    public long? PaymentMethod { get; set; }

    public short DayOfMonth { get; set; }

    public short Frequency { get; set; } = 1;

    public DateTime DateStart { get; set; }

    public DateTime? DateEnd { get; set; }

    public DateTime? GenerateUntil { get; set; }
}
