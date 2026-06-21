namespace Finnance.Api.Modules.SettingsSalary.Application.Dto;

public class SalarySettingUpdateDto
{
    public long SettingsSalary { get; set; }

    public DateTime DateStart { get; set; }

    public DateTime DateEnd { get; set; }

    public decimal HourlyRate { get; set; }

    public decimal BaseSalary { get; set; }

    public decimal InssDiscountPercentage { get; set; }

    public decimal AdminFeePercentage { get; set; }
}
