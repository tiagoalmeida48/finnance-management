using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;
using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.CreditCard.Domain.Entities;

public class CreditCardEntity : BaseEntity
{
    public long CreditCard { get; set; }

    public long User { get; set; }

    public long BankAccount { get; set; }

    public string Name { get; set; }

    public string Color { get; set; }

    public decimal CreditLimit { get; set; }

    public string Notes { get; set; }

    public bool Active { get; set; }

    public override void ValidateCreate()
    {
        if (BankAccount <= 0)
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);

        if (Name.IsEmpty())
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);

        if (Color.IsEmpty())
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);

        if (CreditLimit < 0)
            throw new ApplicationException(Constants.ErrorMessage.InvalidAmount);

        Active = true;
    }

    public override void ValidateUpdate()
    {
        if (CreditCard <= 0)
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);

        if (BankAccount <= 0)
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);

        if (Name.IsEmpty())
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);

        if (Color.IsEmpty())
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);

        if (CreditLimit < 0)
            throw new ApplicationException(Constants.ErrorMessage.InvalidAmount);
    }
}
