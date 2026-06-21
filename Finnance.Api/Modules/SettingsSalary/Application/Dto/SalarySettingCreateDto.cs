namespace Finnance.Api.Modules.SettingsSalary.Application.Dto;

public class SalarySettingCreateDto
{
    public DateTime DateStart { get; set; }

    public decimal HourlyRate { get; set; }

    public decimal BaseSalary { get; set; }

    public decimal InssDiscountPercentage { get; set; }

    public decimal AdminFeePercentage { get; set; }
}
