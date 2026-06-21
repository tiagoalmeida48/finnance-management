using Finnance.Api.Modules.InstallmentGroup.Domain.Entities;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.InstallmentGroup.Application.Services;

public partial class InstallmentGroupService
{
    public InstallmentGroupEntity Get(long installmentGroup, long userId)
    {
        var current = installmentGroupRepository.Search(installmentGroup, quantity: 1).FirstOrDefault();
        if (current == null)
            throw new ApplicationException(Constants.ErrorMessage.RegisterNotFound);

        ValidateOwnership(current, userId);

        return current;
    }

    public List<InstallmentGroupEntity> List(long userId)
    {
        return installmentGroupRepository.Search(user: userId);
    }
}
