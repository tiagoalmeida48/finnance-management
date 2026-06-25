namespace Finnance.Api.Modules.Transaction.Application.Dto;

public class PayBillDto
{
    public long Invoice { get; set; }

    public long Account { get; set; }

    public DateTime PaymentDate { get; set; }
}
