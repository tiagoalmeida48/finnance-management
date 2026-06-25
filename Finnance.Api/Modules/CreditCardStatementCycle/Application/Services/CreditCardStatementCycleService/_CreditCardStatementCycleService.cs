using Finnance.Api.Modules.Common.Application.Services;
using Finnance.Api.Modules.CreditCardStatementCycle.Application.Interfaces;
using Finnance.Api.Modules.CreditCardStatementCycle.Domain.Entities;
using Finnance.Api.Modules.CreditCardStatementCycle.Domain.Interfaces;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.CreditCardStatementCycle.Application.Services;

public partial class CreditCardStatementCycleService(ICreditCardStatementCycleRepository creditCardStatementCycleRepository)
    : BaseService<CreditCardStatementCycleEntity>(creditCardStatementCycleRepository), ICreditCardStatementCycleService
{
    private static readonly DateTime OpenCycleEnd = new(9999, 12, 31);

    public long CreateInitialCycle(long cardId, long userId, DateTime dateStart, short closingDay, short dueDay, string notes)
    {
        var entity = new CreditCardStatementCycleEntity
        {
            User = userId,
            Card = cardId,
            DateStart = dateStart.Date,
            DateEnd = OpenCycleEnd,
            ClosingDay = closingDay,
            DueDay = dueDay,
            Notes = notes
        };

        entity.ValidateCreate();

        return creditCardStatementCycleRepository.Create(entity);
    }

    public long InsertCycle(long cardId, long userId, DateTime dateStart, short closingDay, short dueDay, string notes)
    {
        dateStart = dateStart.Date;

        var target = ResolveInsertTarget(cardId, userId, dateStart);

        var newCycle = new CreditCardStatementCycleEntity
        {
            User = userId,
            Card = cardId,
            DateStart = dateStart,
            DateEnd = target.DateEnd,
            ClosingDay = closingDay,
            DueDay = dueDay,
            Notes = notes
        };

        newCycle.ValidateCreate();

        target.DateEnd = dateStart.AddDays(-1);

        using var tran = GetTransaction();
        creditCardStatementCycleRepository.Update(target);
        var newId = creditCardStatementCycleRepository.Create(newCycle);
        tran.Complete();

        return newId;
    }

    public bool UpdateCycleStart(long creditCardStatementCycle, long userId, DateTime dateStart)
    {
        var current = Get(creditCardStatementCycle, userId);
        current.DateStart = dateStart.Date;
        current.ValidateUpdate();
        ValidateNoCycleOverlap(current.Card, userId, current.DateStart, current.DateEnd, current.CreditCardStatementCycle);

        return creditCardStatementCycleRepository.Update(current);
    }

    public bool UpdateCycleEnd(long creditCardStatementCycle, long userId, DateTime dateEnd)
    {
        var current = Get(creditCardStatementCycle, userId);
        current.DateEnd = dateEnd.Date;
        current.ValidateUpdate();
        ValidateNoCycleOverlap(current.Card, userId, current.DateStart, current.DateEnd, current.CreditCardStatementCycle);

        return creditCardStatementCycleRepository.Update(current);
    }

    public CreditCardStatementCycleEntity UpdateCycle(long creditCardStatementCycle, long userId, short closingDay, short dueDay, string notes)
    {
        var current = Get(creditCardStatementCycle, userId);

        if (closingDay < 1 || closingDay > 31 || dueDay < 1 || dueDay > 31)
            throw new ApplicationException(Constants.ErrorMessage.InvalidStatementDay);

        current.ClosingDay = closingDay;
        current.DueDay = dueDay;
        current.Notes = notes;
        current.ValidateUpdate();

        using var tran = GetTransaction();
        creditCardStatementCycleRepository.Update(current);
        tran.Complete();

        return current;
    }

    public CreditCardStatementCycleEntity DeleteCycle(long creditCardStatementCycle, long userId)
    {
        var current = Get(creditCardStatementCycle, userId);

        var cycles = creditCardStatementCycleRepository.SearchByCard(current.Card, userId)
            .OrderBy(c => c.DateStart)
            .ToList();

        if (cycles.Count <= 1)
            throw new ApplicationException(Constants.ErrorMessage.CycleCannotDeleteOnly);

        var index = cycles.FindIndex(c => c.CreditCardStatementCycle == current.CreditCardStatementCycle);

        using var tran = GetTransaction();

        if (index == 0)
        {
            var next = cycles[1];
            next.DateStart = current.DateStart;
            creditCardStatementCycleRepository.Update(next);
        }
        else
        {
            var previous = cycles[index - 1];
            previous.DateEnd = current.DateEnd;
            creditCardStatementCycleRepository.Update(previous);
        }

        creditCardStatementCycleRepository.DeleteById(current.CreditCardStatementCycle, userId);
        tran.Complete();

        return current;
    }
}
