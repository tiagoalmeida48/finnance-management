namespace Finnance.Api.Modules.Transaction.Application.Dto;

public class BatchPayDto
{
    public List<long> Ids { get; set; }

    public long Account { get; set; }

    public DateTime PaymentDate { get; set; }
}
