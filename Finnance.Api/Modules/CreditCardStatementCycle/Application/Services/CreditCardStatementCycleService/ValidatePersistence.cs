using Finnance.Api.Modules.CreditCardStatementCycle.Domain.Entities;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.CreditCardStatementCycle.Application.Services;

public partial class CreditCardStatementCycleService
{
    private CreditCardStatementCycleEntity ResolveInsertTarget(long cardId, long userId, DateTime dateStart)
    {
        var cycles = creditCardStatementCycleRepository.SearchByCard(cardId, userId);

        if (cycles.Count == 0)
            throw new ApplicationException(Constants.ErrorMessage.CycleNoRegistered);

        var firstStart = cycles.Min(c => c.DateStart);
        if (dateStart < firstStart)
            throw new ApplicationException(Constants.ErrorMessage.CycleStartBeforeFirst);

        var target = cycles.FirstOrDefault(c => c.DateStart <= dateStart && c.DateEnd >= dateStart);
        if (target == null)
            throw new ApplicationException(Constants.ErrorMessage.CycleStartNotContained);

        if (dateStart <= target.DateStart)
            throw new ApplicationException(Constants.ErrorMessage.CycleStartMustBeGreater);

        if (dateStart.AddDays(-1) < target.DateStart)
            throw new ApplicationException(Constants.ErrorMessage.CycleCannotSplit);

        return target;
    }

    private void ValidateNoCycleOverlap(long cardId, long userId, DateTime dateStart, DateTime dateEnd, long excludeCycleId)
    {
        var overlaps = creditCardStatementCycleRepository.SearchByCard(cardId, userId)
            .Any(c => c.CreditCardStatementCycle != excludeCycleId
                      && c.DateStart <= dateEnd
                      && c.DateEnd >= dateStart);

        if (overlaps)
            throw new ApplicationException(Constants.ErrorMessage.CycleOverlap);
    }
}
