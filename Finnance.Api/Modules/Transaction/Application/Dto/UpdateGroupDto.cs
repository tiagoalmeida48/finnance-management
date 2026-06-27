namespace Finnance.Api.Modules.Transaction.Application.Dto;

public class UpdateGroupDto
{
    public long GroupId { get; set; }

    public string Type { get; set; }

    public decimal? Amount { get; set; }

    public DateTime? PaymentDate { get; set; }

    public DateTime? PurchaseDate { get; set; }

    public bool ClearPurchaseDate { get; set; }

    public string Description { get; set; }

    public long? TransactionType { get; set; }

    public long? Category { get; set; }

    public long? PaymentMethod { get; set; }

    public long? Account { get; set; }

    public long? ToAccount { get; set; }

    public long? Card { get; set; }

    public string Notes { get; set; }

    public bool ClearAccount { get; set; }

    public bool ClearToAccount { get; set; }

    public bool ClearCard { get; set; }
}
