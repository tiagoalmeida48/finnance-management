namespace Finnance.Api.Modules.Transaction.Application.Dto;

public class TransactionDisplayDto
{
    public long Transaction { get; set; }

    public long TransactionType { get; set; }

    public long? PaymentMethod { get; set; }

    public decimal? Amount { get; set; }

    public DateTime? PaymentDate { get; set; }

    public DateTime? PurchaseDate { get; set; }

    public string Description { get; set; }

    public long? Account { get; set; }

    public long? ToAccount { get; set; }

    public long? Card { get; set; }

    public long? Category { get; set; }

    public long? Invoice { get; set; }

    public long? InstallmentGroup { get; set; }

    public int? InstallmentNumber { get; set; }

    public long? RecurringGroup { get; set; }

    public int? TotalInstallments { get; set; }

    public bool Fixed { get; set; }

    public bool Paid { get; set; }

    public string Notes { get; set; }

    public bool Active { get; set; }

    public DateTime Created { get; set; }

    public DateTime Updated { get; set; }
}
