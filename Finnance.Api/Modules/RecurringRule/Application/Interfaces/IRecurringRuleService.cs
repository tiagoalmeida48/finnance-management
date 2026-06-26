using Finnance.Api.Modules.Common.Application.Interfaces;
using Finnance.Api.Modules.RecurringRule.Domain.Entities;

namespace Finnance.Api.Modules.RecurringRule.Application.Interfaces;

public interface IRecurringRuleService : IBaseService<RecurringRuleEntity>
{
    long Create(RecurringRuleEntity entity, long userId);

    RecurringRuleEntity Get(long recurringRule, long userId);

    List<RecurringRuleEntity> List(long userId);

    bool Delete(long recurringRule, long userId);

    int GenerateOccurrences(long recurringRule, long userId, DateTime until);
}
