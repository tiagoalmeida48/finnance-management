using Finnance.Api.Modules.Common.Domain.Interfaces;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;
using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.Category.Domain.Entities;

public class CategoryEntity : BaseEntity, IUserOwned
{
    public long Category { get; set; }

    public long User { get; set; }

    public long CategoryType { get; set; }

    public string Name { get; set; }

    public string Color { get; set; }

    public string Icon { get; set; }

    public bool Active { get; set; }

    public override void ValidateCreate()
    {
        Active = true;

        if (Name.IsEmpty())
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);

        if (CategoryType <= 0)
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);
    }

    public override void ValidateUpdate()
    {
        if (Category <= 0)
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);

        if (Name.IsEmpty())
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);

        if (CategoryType <= 0)
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);
    }
}
