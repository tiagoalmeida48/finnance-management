using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;
using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.BankAccount.Domain.Entities;

public class BankAccountEntity : BaseEntity
{
    public long BankAccount { get; set; }

    public long User { get; set; }

    public long AccountType { get; set; }

    public string Name { get; set; }

    public decimal InitialBalance { get; set; }

    public decimal CurrentBalance { get; set; }

    public string Color { get; set; }

    public string Icon { get; set; }

    public string Notes { get; set; }

    public bool Active { get; set; }

    public override void ValidateCreate()
    {
        if (AccountType <= 0)
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);

        if (Name.IsEmpty())
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);

        Active = true;
        CurrentBalance = InitialBalance;
    }

    public override void ValidateUpdate()
    {
        if (BankAccount <= 0)
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);

        if (AccountType <= 0)
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);

        if (Name.IsEmpty())
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);
    }
}
