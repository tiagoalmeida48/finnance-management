namespace Finnance.Api.Modules.Transaction.Application.Dto;

public class TransactionFilterDto
{
    public long Account { get; set; }

    public long Category { get; set; }

    public DateTime? StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    public bool? IsPaid { get; set; }

    public bool SortAsc { get; set; }

    public int Limit { get; set; } = 50;

    public int Offset { get; set; }
}
