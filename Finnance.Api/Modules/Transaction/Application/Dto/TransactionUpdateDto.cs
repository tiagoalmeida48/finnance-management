namespace Finnance.Api.Modules.Transaction.Application.Dto;

public class TransactionUpdateDto
{
    public long Transaction { get; set; }

    public long? TransactionType { get; set; }

    public decimal? Amount { get; set; }

    public DateTime? PaymentDate { get; set; }

    public DateTime? PurchaseDate { get; set; }

    public string Description { get; set; }

    public bool? Paid { get; set; }

    public bool? Fixed { get; set; }

    public long? Account { get; set; }

    public long? ToAccount { get; set; }

    public long? Category { get; set; }

    public long? Card { get; set; }

    public long? PaymentMethod { get; set; }

    public string Notes { get; set; }

    public bool ClearPurchaseDate { get; set; }

    public bool ClearAccount { get; set; }

    public bool ClearToAccount { get; set; }

    public bool ClearCategory { get; set; }

    public bool ClearCard { get; set; }

    public bool ClearPaymentMethod { get; set; }
}
