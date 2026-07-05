using Finnance.Api.Modules.Common.Application.Interfaces;
using Finnance.Api.Modules.SettingsSalary.Application.Dto;
using Finnance.Api.Modules.SettingsSalary.Domain.Entities;

namespace Finnance.Api.Modules.SettingsSalary.Application.Interfaces;

public interface ISettingsSalaryService : IBaseService<SettingsSalaryEntity>
{
    PayrollResultDto CalculatePayroll(PayrollCalculateDto input, long userId);

    List<SettingsSalaryEntity> GetHistory(long userId);

    SettingsSalaryEntity GetCurrent(long userId);

    SettingsSalaryEntity GetOpen(long userId);

    long CreateWithValidity(SettingsSalaryEntity entity, long userId);

    bool UpdateSetting(SettingsSalaryEntity entity, long userId);

    bool CloseSetting(long userId, long settingsSalary, DateTime newEnd);

    bool DeleteCurrentAndRestorePrevious(long userId);
}
