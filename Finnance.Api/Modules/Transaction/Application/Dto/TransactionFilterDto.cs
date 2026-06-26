namespace Finnance.Api.Modules.Transaction.Application.Dto;

public class TransactionFilterDto
{
    public long Account { get; set; }

    public long Category { get; set; }

    public long Card { get; set; }

    public long Invoice { get; set; }

    public long TransactionType { get; set; }

    public long PaymentMethod { get; set; }

    public string Search { get; set; }

    public bool HideCreditCards { get; set; }

    public bool OnlyCreditCards { get; set; }

    public bool OnlyInstallments { get; set; }

    public bool OnlyFixed { get; set; }

    public DateTime? StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    public bool? IsPaid { get; set; }

    public bool SortAsc { get; set; }

    public string SortField { get; set; }

    public int Limit { get; set; } = 50;

    public int Offset { get; set; }
}
