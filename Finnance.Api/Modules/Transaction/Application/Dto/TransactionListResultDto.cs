namespace Finnance.Api.Modules.Transaction.Application.Dto;

public class TransactionListResultDto
{
    public List<TransactionListItemDto> Items { get; set; }

    public int TotalLines { get; set; }

    public bool HasNextPage { get; set; }
}
