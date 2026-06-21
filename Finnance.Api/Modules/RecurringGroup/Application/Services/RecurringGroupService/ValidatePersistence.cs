using Finnance.Api.Modules.RecurringGroup.Domain.Entities;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.RecurringGroup.Application.Services;

public partial class RecurringGroupService
{
    private RecurringGroupEntity GetOwned(long recurringGroup, long userId)
    {
        var current = Get(recurringGroup, userId);

        if (current == null)
            throw new ApplicationException(Constants.ErrorMessage.RegisterNotFound);

        if (current.User != userId)
            throw new ApplicationException(Constants.ErrorMessage.AccessDeniedResource);

        return current;
    }
}
