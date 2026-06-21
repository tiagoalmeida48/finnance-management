using System.Globalization;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.SettingsSalary.Domain.Entities;

public class SettingsSalaryEntity : Finnance.Api.Shared.BaseClass.BaseEntity
{
    public long SettingsSalary { get; set; }

    public long User { get; set; }

    public DateTime DateStart { get; set; }

    public DateTime DateEnd { get; set; }

    public decimal HourlyRate { get; set; }

    public decimal BaseSalary { get; set; }

    public decimal InssDiscountPercentage { get; set; }

    public decimal AdminFeePercentage { get; set; }

    public bool Active { get; set; }

    public override void ValidateCreate()
    {
        Active = true;

        if (DateStart == default)
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);

        if (DateEnd == default)
            DateEnd = OpenEndDate();

        if (DateEnd < DateStart)
            throw new ApplicationException(Constants.ErrorMessage.SalaryPeriodOverlap);
    }

    public override void ValidateUpdate()
    {
        if (SettingsSalary <= 0)
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);

        if (DateStart == default || DateEnd == default)
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);

        if (DateEnd < DateStart)
            throw new ApplicationException(Constants.ErrorMessage.SalaryPeriodOverlap);
    }

    public static DateTime OpenEndDate()
    {
        return DateTime.ParseExact(Constants.OpenCycleEndDate, "yyyy-MM-dd", CultureInfo.InvariantCulture);
    }
}
