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

    private SettingsSalaryEntity GetOwned(long settingsSalary, long userId)
    {
        var current = settingsSalaryRepository.Search(userId, settingsSalary: settingsSalary, quantity: 1).FirstOrDefault();
        if (current == null)
            throw new ApplicationException(Constants.ErrorMessage.AccessDeniedResource);

        return current;
    }
}
