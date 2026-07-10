using Finnance.Api.Modules.CreditCard.Application.Dto;
using Finnance.Api.Modules.CreditCard.Domain.Entities;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.CreditCard.Application.Services;

public partial class CreditCardService
{
    public CreditCardEntity GetCard(long creditCard, long userId)
    {
        var current = creditCardRepository.Search(creditCard: creditCard, quantity: 1).FirstOrDefault();
        if (current == null)
            throw new ApplicationException(Constants.ErrorMessage.CardNotFound);

        if (current.User != userId)
            throw new ApplicationException(Constants.ErrorMessage.AccessDeniedResource);

        return current;
    }

    public List<CreditCardEntity> List(long userId, bool includeInactive = false)
    {
        return creditCardRepository.Search(user: userId, active: !includeInactive);
    }

    public CreditCardStatsDto GetStats(long creditCard, long userId)
    {
        EnsureOwnership(creditCard, userId);

        var stats = creditCardRepository.GetStats(creditCard, userId);
        if (stats == null)
            throw new ApplicationException(Constants.ErrorMessage.CardNotFound);

        return stats;
    }

    public List<CreditCardStatsDto> GetAllStats(long userId)
    {
        return creditCardRepository.GetAllStats(userId);
    }
}
