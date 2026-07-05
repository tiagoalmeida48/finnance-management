namespace Finnance.Api.Modules.Transaction.Application.Dto;

public class TrackingMonthDto
{
    public int Month { get; set; }

    public List<TrackingItemDto> Items { get; set; }

    public int TotalItems { get; set; }

    public int PaidItems { get; set; }

    public decimal Progress { get; set; }

    public decimal TotalAmount { get; set; }
}
