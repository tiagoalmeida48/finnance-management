using Finnance.Api.Modules.Common.Domain.Interfaces;
using Finnance.Api.Shared;
using Finnance.Api.Shared.BaseClass;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.RecurringGroup.Domain.Entities;

public class RecurringGroupEntity : BaseEntity, IUserOwned
{
    public long RecurringGroup { get; set; }

    public long User { get; set; }

    public bool Active { get; set; }

    public override void ValidateCreate()
    {
        if (User <= 0)
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);
    }
}
