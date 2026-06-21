using Finnance.Api.Modules.Common.Domain.Interfaces;
using Finnance.Api.Modules.InstallmentGroup.Domain.Entities;

namespace Finnance.Api.Modules.InstallmentGroup.Domain.Interfaces;

public interface IInstallmentGroupRepository : IBaseRepository<InstallmentGroupEntity>
{
    List<InstallmentGroupEntity> Search(long installmentGroup = 0,
                                        long user = 0,
                                        bool active = false,
                                        int quantity = 0);
}
