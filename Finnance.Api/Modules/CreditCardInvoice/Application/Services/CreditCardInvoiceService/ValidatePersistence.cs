using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.CreditCardInvoice.Application.Services;

public partial class CreditCardInvoiceService
{
    private void ValidateOwnership(long cardId, long userId)
    {
        creditCardService.EnsureOwnership(cardId, userId);
    }
}
