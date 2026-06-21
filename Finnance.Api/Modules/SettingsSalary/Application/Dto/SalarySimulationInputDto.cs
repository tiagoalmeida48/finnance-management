namespace Finnance.Api.Modules.SettingsSalary.Application.Dto;

public class SalarySimulationInputDto
{
    public decimal BaseSalary { get; set; }

    public decimal HourlyRate { get; set; }

    public decimal ExtraHours { get; set; }

    public decimal InssDiscountPercentage { get; set; }

    public decimal AdminFeePercentage { get; set; }
}
