namespace Finnance.Api.Modules.Transaction.Application.Dto;

public class BatchChangeDayDto
{
    public List<long> Ids { get; set; }

    public int Day { get; set; }
}
