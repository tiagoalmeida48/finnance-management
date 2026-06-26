using Finnance.Api.Modules.Common.Domain.Interfaces;
using Finnance.Api.Shared.Utils;
using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.InstallmentGroup.Domain.Entities;

public class InstallmentGroupEntity : BaseEntity, IUserOwned
{
    public long InstallmentGroup { get; set; }

    public long User { get; set; }

    public int TotalInstallments { get; set; }

    public bool Active { get; set; }

    public override void ValidateCreate()
    {
        Active = true;

        if (User <= 0)
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);

        if (TotalInstallments <= 0)
            throw new ApplicationException(Constants.ErrorMessage.InvalidInstallment);
    }
}
