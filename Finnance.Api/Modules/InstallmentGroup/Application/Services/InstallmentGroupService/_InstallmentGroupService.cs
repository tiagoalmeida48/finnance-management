using Finnance.Api.Modules.Common.Application.Services;
using Finnance.Api.Modules.InstallmentGroup.Application.Interfaces;
using Finnance.Api.Modules.InstallmentGroup.Domain.Entities;
using Finnance.Api.Modules.InstallmentGroup.Domain.Interfaces;

namespace Finnance.Api.Modules.InstallmentGroup.Application.Services;

public partial class InstallmentGroupService(IInstallmentGroupRepository installmentGroupRepository) : BaseService<InstallmentGroupEntity>(installmentGroupRepository), IInstallmentGroupService
{
    public long Create(InstallmentGroupEntity entity, long userId)
    {
        entity.User = userId;
        entity.ValidateCreate();

        return installmentGroupRepository.Create(entity);
    }

    public bool Delete(long installmentGroup, long userId)
    {
        var current = Get(installmentGroup, userId);

        return installmentGroupRepository.Delete(current);
    }
}
