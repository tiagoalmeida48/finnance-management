namespace Finnance.Api.Modules.Transaction.Application.Dto;

public class ImportRowDto
{
    public string Date { get; set; }

    public string Description { get; set; }

    public decimal Amount { get; set; }

    public long TransactionType { get; set; }

    public long? Category { get; set; }

    public int Installments { get; set; }

    public string Notes { get; set; }
}
