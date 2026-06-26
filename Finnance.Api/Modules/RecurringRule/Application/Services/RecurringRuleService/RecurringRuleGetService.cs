using Finnance.Api.Modules.RecurringRule.Domain.Entities;

namespace Finnance.Api.Modules.RecurringRule.Application.Services;

public partial class RecurringRuleService
{
    public RecurringRuleEntity Get(long recurringRule, long userId)
    {
        return recurringRuleRepository.Search(recurringRule, userId, active: true, quantity: 1).FirstOrDefault();
    }

    public List<RecurringRuleEntity> List(long userId)
    {
        return recurringRuleRepository.Search(user: userId, active: true);
    }
}
