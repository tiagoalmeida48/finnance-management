using Finnance.Api.Shared.Utils;
using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.CreditCardStatementCycle.Domain.Entities;

public class CreditCardStatementCycleEntity : BaseEntity
{
    public long CreditCardStatementCycle { get; set; }

    public long User { get; set; }

    public long Card { get; set; }

    public DateTime DateStart { get; set; }

    public DateTime DateEnd { get; set; }

    public short ClosingDay { get; set; }

    public short DueDay { get; set; }

    public string Notes { get; set; }

    public bool Active { get; set; }

    public override void ValidateCreate()
    {
        Active = true;

        if (User <= 0)
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);

        if (Card <= 0)
            throw new ApplicationException(Constants.ErrorMessage.CardNotFound);

        if (DateStart == default)
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);

        if (ClosingDay < 1 || ClosingDay > 31 || DueDay < 1 || DueDay > 31)
            throw new ApplicationException(Constants.ErrorMessage.InvalidStatementDay);
    }

    public override void ValidateUpdate()
    {
        if (CreditCardStatementCycle <= 0)
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);

        if (User <= 0)
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);
    }
}
