namespace Finnance.Api.Modules.SettingsSalary.Application.Dto;

public class PayrollResultDto
{
    public decimal GrossPay { get; set; }

    public decimal BaseSalary { get; set; }

    public decimal ProfitAdvance { get; set; }

    public decimal InssDiscount { get; set; }

    public decimal AdminFeeDiscount { get; set; }

    public decimal TotalDiscounts { get; set; }

    public decimal NetPay { get; set; }
}
