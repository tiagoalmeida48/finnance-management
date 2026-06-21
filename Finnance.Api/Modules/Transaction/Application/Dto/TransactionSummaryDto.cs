namespace Finnance.Api.Modules.Transaction.Application.Dto;

public class TransactionSummaryDto
{
    public decimal Income { get; set; }

    public decimal Expense { get; set; }

    public decimal Pending { get; set; }
}
