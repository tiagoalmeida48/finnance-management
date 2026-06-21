using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.CreditCard.Application.Services;

public partial class CreditCardService
{
    public void EnsureOwnership(long creditCard, long userId)
    {
        var current = creditCardRepository.Search(creditCard: creditCard, quantity: 1).FirstOrDefault();
        if (current == null)
            throw new ApplicationException(Constants.ErrorMessage.CardNotFound);

        if (current.User != userId)
            throw new ApplicationException(Constants.ErrorMessage.AccessDeniedResource);
    }
}
