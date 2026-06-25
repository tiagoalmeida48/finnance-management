using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.SettingsSalary.Application.Services;

public partial class SettingsSalaryService
{
    private void ValidateNoOverlap(long userId, DateTime dateStart, DateTime dateEnd, long ignoreSettingsSalary)
    {
        var periods = settingsSalaryRepository.Search(userId);

        var overlap = periods.Any(p => p.SettingsSalary != ignoreSettingsSalary
                                       && dateStart <= p.DateEnd
                                       && dateEnd >= p.DateStart);

        if (overlap)
            throw new ApplicationException(Constants.ErrorMessage.SalaryPeriodOverlap);
    }
}
