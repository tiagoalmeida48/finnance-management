using Finnance.Api.Modules.InstallmentGroup.Domain.Entities;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.InstallmentGroup.Application.Services;

public partial class InstallmentGroupService
{
    private void ValidateOwnership(InstallmentGroupEntity entity, long userId)
    {
        if (entity.User != userId)
            throw new ApplicationException(Constants.ErrorMessage.AccessDeniedResource);
    }
}
