using Finnance.Api.Modules.Common.Domain.Interfaces;
using Finnance.Api.Modules.RecurringGroup.Domain.Entities;

namespace Finnance.Api.Modules.RecurringGroup.Domain.Interfaces;

public interface IRecurringGroupRepository : IBaseRepository<RecurringGroupEntity>
{
    List<RecurringGroupEntity> Search(long recurringGroup = 0,
                                      long user = 0,
                                      bool active = false,
                                      int quantity = 0);
}
