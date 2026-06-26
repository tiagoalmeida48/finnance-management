using Finnance.Api.Modules.Common.Domain.Interfaces;
using Finnance.Api.Modules.RecurringRule.Domain.Entities;

namespace Finnance.Api.Modules.RecurringRule.Domain.Interfaces;

public interface IRecurringRuleRepository : IBaseRepository<RecurringRuleEntity>
{
    List<RecurringRuleEntity> Search(long recurringRule = 0, long user = 0, bool active = false, int quantity = 0);

    List<string> OccurrenceMonths(long recurringRule, long user);

    void ClearOccurrences(long recurringRule, long user);
}
