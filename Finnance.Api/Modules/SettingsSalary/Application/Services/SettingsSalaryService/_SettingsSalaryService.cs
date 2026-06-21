using Finnance.Api.Modules.Common.Application.Services;
using Finnance.Api.Modules.SettingsSalary.Application.Interfaces;
using Finnance.Api.Modules.SettingsSalary.Domain.Entities;
using Finnance.Api.Modules.SettingsSalary.Domain.Interfaces;
using Finnance.Api.Modules.SystemConfig.Application.Interfaces;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.SettingsSalary.Application.Services;

public partial class SettingsSalaryService(ISettingsSalaryRepository settingsSalaryRepository,
                                           ISystemConfigService systemConfigService)
    : BaseService<SettingsSalaryEntity>(settingsSalaryRepository), ISettingsSalaryService
{
    public long CreateWithValidity(SettingsSalaryEntity entity, long userId)
    {
        entity.User = userId;
        entity.DateEnd = SettingsSalaryEntity.OpenEndDate();
        entity.ValidateCreate();

        ValidateNoOverlap(userId, entity.DateStart, entity.DateEnd, 0);

        using var tran = GetTransaction();

        var open = settingsSalaryRepository.Search(userId, dateEnd: SettingsSalaryEntity.OpenEndDate(), quantity: 1).FirstOrDefault();
        if (open != null)
        {
            open.DateEnd = entity.DateStart.AddDays(-1);
            if (open.DateEnd < open.DateStart)
                throw new ApplicationException(Constants.ErrorMessage.SalaryPeriodOverlap);

            settingsSalaryRepository.Update(open);
        }

        var id = settingsSalaryRepository.Create(entity);
        tran.Complete();
        return id;
    }

    public bool UpdateSetting(SettingsSalaryEntity entity, long userId)
    {
        var current = GetOwned(entity.SettingsSalary, userId);

        entity.User = userId;
        entity.ValidateUpdate();
        ValidateNoOverlap(userId, entity.DateStart, entity.DateEnd, entity.SettingsSalary);

        current.DateStart = entity.DateStart;
        current.DateEnd = entity.DateEnd;
        current.HourlyRate = entity.HourlyRate;
        current.BaseSalary = entity.BaseSalary;
        current.InssDiscountPercentage = entity.InssDiscountPercentage;
        current.AdminFeePercentage = entity.AdminFeePercentage;

        using var tran = GetTransaction();
        settingsSalaryRepository.Update(current);
        tran.Complete();
        return true;
    }

    public bool CloseSetting(long userId, long settingsSalary, DateTime newEnd)
    {
        var current = GetOwned(settingsSalary, userId);

        if (newEnd < current.DateStart)
            throw new ApplicationException(Constants.ErrorMessage.SalaryPeriodOverlap);

        current.DateEnd = newEnd;

        using var tran = GetTransaction();
        settingsSalaryRepository.Update(current);
        tran.Complete();
        return true;
    }
}
