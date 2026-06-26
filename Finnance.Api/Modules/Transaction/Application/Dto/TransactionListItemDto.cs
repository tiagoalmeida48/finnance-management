namespace Finnance.Api.Modules.Transaction.Application.Dto;

public class TransactionListItemDto
{
    public bool IsGroup { get; set; }

    public TransactionGroupDto Group { get; set; }

    public TransactionDisplayDto Transaction { get; set; }
}
