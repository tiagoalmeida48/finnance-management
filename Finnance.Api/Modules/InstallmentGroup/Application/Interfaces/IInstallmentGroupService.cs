using Finnance.Api.Modules.Common.Application.Interfaces;
using Finnance.Api.Modules.InstallmentGroup.Domain.Entities;

namespace Finnance.Api.Modules.InstallmentGroup.Application.Interfaces;

public interface IInstallmentGroupService : IBaseService<InstallmentGroupEntity>
{
    long Create(InstallmentGroupEntity entity, long userId);
    InstallmentGroupEntity Get(long installmentGroup, long userId);
    List<InstallmentGroupEntity> List(long userId);
    bool Delete(long installmentGroup, long userId);
}
