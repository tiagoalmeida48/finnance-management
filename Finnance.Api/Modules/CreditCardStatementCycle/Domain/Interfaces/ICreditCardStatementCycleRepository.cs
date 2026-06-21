using Finnance.Api.Modules.Common.Domain.Interfaces;
using Finnance.Api.Modules.CreditCardStatementCycle.Domain.Entities;

namespace Finnance.Api.Modules.CreditCardStatementCycle.Domain.Interfaces;

public interface ICreditCardStatementCycleRepository : IBaseRepository<CreditCardStatementCycleEntity>
{
    List<CreditCardStatementCycleEntity> Search(long creditCardStatementCycle = 0,
                                                long user = 0,
                                                long card = 0,
                                                bool active = false,
                                                int quantity = 0);

    List<CreditCardStatementCycleEntity> SearchByCard(long card, long user);

    CreditCardStatementCycleEntity SearchOpen(long card, long user);

    CreditCardStatementCycleEntity SearchContaining(long card, long user, DateTime date);
}
