namespace Finnance.Api.Modules.SettingsSalary.Application.Dto;

public class SalarySimulationResultDto
{
    public decimal Gross { get; set; }

    public decimal Inss { get; set; }

    public decimal AdminFee { get; set; }

    public decimal Net { get; set; }
}
