namespace Finnance.Api.Modules.Transaction.Application.Dto;

public class TransactionGroupDto
{
    public long GroupId { get; set; }

    public string Type { get; set; }

    public int TotalInstallments { get; set; }

    public int TotalItemsCount { get; set; }

    public int PaidItemsCount { get; set; }

    public int PaidItemsPercent { get; set; }

    public decimal TotalAmount { get; set; }

    public decimal PaidAmount { get; set; }

    public bool IsAllPaid { get; set; }

    public long? Category { get; set; }

    public string Description { get; set; }

    public TransactionDisplayDto MainTransaction { get; set; }

    public List<TransactionDisplayDto> Items { get; set; }
}
