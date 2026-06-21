using Finnance.Api.Modules.SettingsSalary.Application.Dto;
using Finnance.Api.Modules.SettingsSalary.Domain.Entities;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.SettingsSalary.Application.Services;

public partial class SettingsSalaryService
{
    public List<SettingsSalaryEntity> GetHistory(long userId)
    {
        return settingsSalaryRepository.Search(userId);
    }

    public SettingsSalaryEntity GetCurrent(long userId)
    {
        var current = settingsSalaryRepository.Search(userId, coversDate: DateTime.Today, quantity: 1).FirstOrDefault();
        if (current == null)
            throw new ApplicationException(Constants.ErrorMessage.SalaryOpenNotFound);

        return current;
    }

    public SettingsSalaryEntity GetOpen(long userId)
    {
        var open = settingsSalaryRepository.Search(userId, dateEnd: SettingsSalaryEntity.OpenEndDate(), quantity: 1).FirstOrDefault();
        if (open == null)
            throw new ApplicationException(Constants.ErrorMessage.SalaryOpenNotFound);

        return open;
    }

    public SalarySimulationResultDto SimulatePayroll(SalarySimulationInputDto input)
    {
        var ceiling = ResolveInssCeiling();

        var gross = input.BaseSalary + (input.HourlyRate * input.ExtraHours);
        var inssBase = Math.Min(input.BaseSalary, ceiling);
        var inss = inssBase * (input.InssDiscountPercentage / 100m);
        var adminFee = gross * (input.AdminFeePercentage / 100m);
        var net = gross - inss - adminFee;

        return new SalarySimulationResultDto
        {
            Gross = Math.Round(gross, 2),
            Inss = Math.Round(inss, 2),
            AdminFee = Math.Round(adminFee, 2),
            Net = Math.Round(net, 2)
        };
    }

    private SettingsSalaryEntity GetOwned(long settingsSalary, long userId)
    {
        var current = settingsSalaryRepository.Search(userId, settingsSalary: settingsSalary, quantity: 1).FirstOrDefault();
        if (current == null)
            throw new ApplicationException(Constants.ErrorMessage.AccessDeniedResource);

        return current;
    }
}
