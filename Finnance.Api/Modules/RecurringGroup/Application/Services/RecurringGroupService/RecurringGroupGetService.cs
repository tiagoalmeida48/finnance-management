using Finnance.Api.Modules.RecurringGroup.Domain.Entities;

namespace Finnance.Api.Modules.RecurringGroup.Application.Services;

public partial class RecurringGroupService
{
    public RecurringGroupEntity Get(long recurringGroup, long userId)
    {
        return recurringGroupRepository.Search(recurringGroup, userId, active: true, quantity: 1).FirstOrDefault();
    }

    public List<RecurringGroupEntity> List(long userId)
    {
        return recurringGroupRepository.Search(user: userId, active: true);
    }
}
