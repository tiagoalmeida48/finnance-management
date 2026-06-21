using Finnance.Api.Modules.Common.Application.Interfaces;
using Finnance.Api.Modules.RecurringGroup.Domain.Entities;

namespace Finnance.Api.Modules.RecurringGroup.Application.Interfaces;

public interface IRecurringGroupService : IBaseService<RecurringGroupEntity>
{
    long Create(RecurringGroupEntity entity, long userId);

    RecurringGroupEntity Get(long recurringGroup, long userId);

    List<RecurringGroupEntity> List(long userId);

    bool Delete(long recurringGroup, long userId);
}
