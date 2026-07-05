namespace Finnance.Api.Modules.Transaction.Application.Dto;

public class TrackingItemDto
{
    public long Id { get; set; }

    public string ItemType { get; set; }

    public string Name { get; set; }

    public decimal Total { get; set; }

    public bool IsPaid { get; set; }

    public long? Account { get; set; }
}
