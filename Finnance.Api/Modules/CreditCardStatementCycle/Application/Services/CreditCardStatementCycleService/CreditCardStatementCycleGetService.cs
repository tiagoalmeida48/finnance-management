using Finnance.Api.Modules.CreditCardStatementCycle.Domain.Entities;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.CreditCardStatementCycle.Application.Services;

public partial class CreditCardStatementCycleService
{
    public CreditCardStatementCycleEntity Get(long creditCardStatementCycle, long userId)
    {
        var current = creditCardStatementCycleRepository.Search(creditCardStatementCycle: creditCardStatementCycle, quantity: 1).FirstOrDefault();
        if (current == null)
            throw new ApplicationException(Constants.ErrorMessage.StatementCycleNotFound);

        if (current.User != userId)
            throw new ApplicationException(Constants.ErrorMessage.AccessDeniedResource);

        return current;
    }

    public List<CreditCardStatementCycleEntity> GetByCard(long cardId, long userId)
    {
        return creditCardStatementCycleRepository.SearchByCard(cardId, userId);
    }

    public CreditCardStatementCycleEntity GetOpenCycle(long cardId, long userId)
    {
        var current = creditCardStatementCycleRepository.SearchOpen(cardId, userId);
        if (current == null)
            throw new ApplicationException(Constants.ErrorMessage.NoOpenStatementCycle);

        return current;
    }
}
