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

    public long? Category { get; set; }

    public long? PaymentMethod { get; set; }
}
