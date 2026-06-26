using System.Globalization;
using Finnance.Api.Modules.Common.Domain.Interfaces;
using Finnance.Api.Shared;
using Finnance.Api.Shared.BaseClass;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.RecurringRule.Domain.Entities;

public class RecurringRuleEntity : BaseEntity, IUserOwned
{
    public long RecurringRule { get; set; }

    public long User { get; set; }

    public string Description { get; set; }

    public decimal Amount { get; set; }

    public long TransactionType { get; set; }

    public long? Category { get; set; }

    public long? Account { get; set; }

    public long? Card { get; set; }

    public long? PaymentMethod { get; set; }

    public short DayOfMonth { get; set; }

    public short Frequency { get; set; }

    public DateTime DateStart { get; set; }

    public DateTime DateEnd { get; set; }

    public bool Active { get; set; }

    public override void ValidateCreate()
    {
        Active = true;

        if (Frequency <= 0)
            Frequency = 1;

        if (DateEnd == default)
            DateEnd = OpenEndDate();

        if (Description.IsEmpty())
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);

        if (Amount <= 0)
            throw new ApplicationException(Constants.ErrorMessage.InvalidAmount);

        if (TransactionType != Constants.TransactionTypeId.INCOME
            && TransactionType != Constants.TransactionTypeId.EXPENSE
            && TransactionType != Constants.TransactionTypeId.TRANSFER)
            throw new ApplicationException(Constants.ErrorMessage.InvalidTransactionType);

        if (DayOfMonth < 1 || DayOfMonth > 31)
            throw new ApplicationException(Constants.ErrorMessage.InvalidDayOfMonth);

        if (DateStart == default)
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);

        if (DateEnd < DateStart)
            throw new ApplicationException(Constants.ErrorMessage.InvalidHorizon);
    }

    public override void ValidateUpdate()
    {
        if (RecurringRule <= 0)
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);

        ValidateCreate();
    }

    public static DateTime OpenEndDate()
    {
        return DateTime.ParseExact(Constants.OpenCycleEndDate, "yyyy-MM-dd", CultureInfo.InvariantCulture);
    }
}
