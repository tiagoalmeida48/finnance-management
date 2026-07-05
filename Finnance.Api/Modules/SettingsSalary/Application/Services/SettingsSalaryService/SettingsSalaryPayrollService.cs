using Finnance.Api.Modules.SettingsSalary.Application.Dto;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.SettingsSalary.Application.Services;

public partial class SettingsSalaryService
{
    public PayrollResultDto CalculatePayroll(PayrollCalculateDto input, long userId)
    {
        var setting = input.SettingsSalary is > 0
            ? GetOwned(input.SettingsSalary.Value, userId)
            : GetCurrent(userId);

        var totalHours = Math.Max(0, input.TotalHours);
        var hourlyRate = Math.Max(0, setting.HourlyRate);
        var baseSalary = Math.Max(0, setting.BaseSalary);
        var inssPercentage = Math.Max(0, setting.InssDiscountPercentage);
        var adminFeePercentage = Math.Max(0, setting.AdminFeePercentage);
        var tetoInss = systemConfigService.GetByKey(Constants.SystemConfigKey.TetoInss).Value;

        var grossPay = Round2(totalHours * hourlyRate);
        var profitAdvance = grossPay > 0 ? Round2(grossPay - baseSalary) : 0;
        var inssDiscount = grossPay > 0 ? Round2(-Math.Min(baseSalary * (inssPercentage / 100m), tetoInss)) : 0;
        var adminFeeDiscount = grossPay > 0 ? Round2(-(grossPay * (adminFeePercentage / 100m))) : 0;
        var totalDiscounts = Round2(inssDiscount + adminFeeDiscount);
        var netPay = Round2(grossPay + totalDiscounts);

        return new PayrollResultDto
        {
            GrossPay = grossPay,
            BaseSalary = baseSalary,
            ProfitAdvance = profitAdvance,
            InssDiscount = inssDiscount,
            AdminFeeDiscount = adminFeeDiscount,
            TotalDiscounts = totalDiscounts,
            NetPay = netPay
        };
    }

    private static decimal Round2(decimal value)
    {
        return Math.Round(value, 2, MidpointRounding.AwayFromZero);
    }
}
