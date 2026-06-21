using Finnance.Api.Modules.Common.Application.Services;
using Finnance.Api.Modules.RecurringGroup.Application.Interfaces;
using Finnance.Api.Modules.RecurringGroup.Domain.Entities;
using Finnance.Api.Modules.RecurringGroup.Domain.Interfaces;

namespace Finnance.Api.Modules.RecurringGroup.Application.Services;

public partial class RecurringGroupService(IRecurringGroupRepository recurringGroupRepository)
    : BaseService<RecurringGroupEntity>(recurringGroupRepository), IRecurringGroupService
{
    public long Create(RecurringGroupEntity entity, long userId)
    {
        entity.User = userId;
        entity.Active = true;
        entity.ValidateCreate();

        return recurringGroupRepository.Create(entity);
    }

    public bool Delete(long recurringGroup, long userId)
    {
        var current = GetOwned(recurringGroup, userId);

        return recurringGroupRepository.Delete(current);
    }
}
