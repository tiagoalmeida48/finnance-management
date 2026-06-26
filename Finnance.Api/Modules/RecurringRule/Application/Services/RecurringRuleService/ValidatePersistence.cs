using Finnance.Api.Modules.RecurringRule.Domain.Entities;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.RecurringRule.Application.Services;

public partial class RecurringRuleService
{
    private RecurringRuleEntity GetOwned(long recurringRule, long userId)
    {
        var current = Get(recurringRule, userId);
        if (current == null)
            throw new ApplicationException(Constants.ErrorMessage.RecurringRuleNotFound);

        if (current.User != userId)
            throw new ApplicationException(Constants.ErrorMessage.AccessDeniedResource);

        return current;
    }
}
