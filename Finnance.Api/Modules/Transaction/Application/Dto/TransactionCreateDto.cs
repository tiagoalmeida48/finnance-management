namespace Finnance.Api.Modules.Transaction.Application.Dto;

public class TransactionCreateDto
{
    public long TransactionType { get; set; }

    public decimal Amount { get; set; }

    public DateTime? PaymentDate { get; set; }

    public DateTime? PurchaseDate { get; set; }

    public string Description { get; set; }

    public long? Account { get; set; }

    public long? ToAccount { get; set; }

    public long? Card { get; set; }

    public long? Category { get; set; }

    public long? PaymentMethod { get; set; }

    public string Notes { get; set; }

    public bool IsPaid { get; set; }

    public bool IsFixed { get; set; }

    public bool IsInstallment { get; set; }

    public int TotalInstallments { get; set; } = 1;

    public int RepeatCount { get; set; } = 1;

    public List<decimal> InstallmentAmounts { get; set; }

    public long? RecurringGroup { get; set; }

    public long? RecurringRule { get; set; }
}
