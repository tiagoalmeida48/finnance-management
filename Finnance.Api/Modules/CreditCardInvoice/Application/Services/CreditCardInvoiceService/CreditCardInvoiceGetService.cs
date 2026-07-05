using Finnance.Api.Modules.CreditCardInvoice.Domain.Entities;
using Finnance.Api.Modules.CreditCardStatementCycle.Domain.Entities;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.CreditCardInvoice.Application.Services;

public partial class CreditCardInvoiceService
{
    public List<CreditCardInvoiceEntity> GetByCard(long cardId, long userId, int year = 0, int limit = 0, int offset = 0)
    {
        ValidateOwnership(cardId, userId);
        return creditCardInvoiceRepository.SearchByCardYear(cardId, userId, year, limit, offset);
    }

    public int CountByCard(long cardId, long userId, int year = 0)
    {
        ValidateOwnership(cardId, userId);
        return creditCardInvoiceRepository.CountByCardYear(cardId, userId, year);
    }

    public List<CreditCardInvoiceEntity> ListByYear(int year, long userId)
    {
        return creditCardInvoiceRepository.SearchByYear(userId, year);
    }

    public CreditCardInvoiceEntity GetByMonth(long cardId, string monthKey, long userId)
    {
        var invoice = creditCardInvoiceRepository.SearchByCardMonth(cardId, userId, monthKey);
        if (invoice == null)
            throw new ApplicationException(Constants.ErrorMessage.InvoiceNotFound);

        return invoice;
    }

    private CreditCardStatementCycleEntity ResolveOpenCycle(long cardId, long userId)
    {
        try
        {
            return creditCardStatementCycleService.GetOpenCycle(cardId, userId);
        }
        catch (ApplicationException)
        {
            return null;
        }
    }
}
