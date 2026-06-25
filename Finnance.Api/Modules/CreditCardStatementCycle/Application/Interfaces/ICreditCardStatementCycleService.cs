using Finnance.Api.Modules.Common.Application.Interfaces;
using Finnance.Api.Modules.CreditCardStatementCycle.Domain.Entities;

namespace Finnance.Api.Modules.CreditCardStatementCycle.Application.Interfaces;

public interface ICreditCardStatementCycleService : IBaseService<CreditCardStatementCycleEntity>
{
    CreditCardStatementCycleEntity Get(long creditCardStatementCycle, long userId);

    List<CreditCardStatementCycleEntity> GetByCard(long cardId, long userId);

    CreditCardStatementCycleEntity GetOpenCycle(long cardId, long userId);

    long CreateInitialCycle(long cardId, long userId, DateTime dateStart, short closingDay, short dueDay, string notes);

    long InsertCycle(long cardId, long userId, DateTime dateStart, short closingDay, short dueDay, string notes);

    bool UpdateCycleStart(long creditCardStatementCycle, long userId, DateTime dateStart);

    bool UpdateCycleEnd(long creditCardStatementCycle, long userId, DateTime dateEnd);

    CreditCardStatementCycleEntity UpdateCycle(long creditCardStatementCycle, long userId, short closingDay, short dueDay, string notes);

    CreditCardStatementCycleEntity DeleteCycle(long creditCardStatementCycle, long userId);
}
