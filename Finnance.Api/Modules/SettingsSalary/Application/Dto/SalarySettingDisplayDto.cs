namespace Finnance.Api.Modules.SettingsSalary.Application.Dto;

public class SalarySettingDisplayDto
{
    public long SettingsSalary { get; set; }

    public DateTime DateStart { get; set; }

    public DateTime DateEnd { get; set; }

    public decimal HourlyRate { get; set; }

    public decimal BaseSalary { get; set; }

    public decimal InssDiscountPercentage { get; set; }

    public decimal AdminFeePercentage { get; set; }

    public bool Active { get; set; }

    public DateTime Created { get; set; }

    public DateTime Updated { get; set; }
}
