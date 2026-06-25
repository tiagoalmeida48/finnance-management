using Finnance.Api.Modules.Common.Application.Services;
using Finnance.Api.Modules.CreditCardInvoice.Application.Interfaces;
using Finnance.Api.Modules.CreditCardInvoice.Domain.Entities;
using Finnance.Api.Modules.CreditCardInvoice.Domain.Interfaces;
using Finnance.Api.Modules.CreditCard.Application.Interfaces;
using Finnance.Api.Modules.CreditCardStatementCycle.Application.Interfaces;
using Finnance.Api.Shared.Utils;
using System.Globalization;
using System.Linq;

namespace Finnance.Api.Modules.CreditCardInvoice.Application.Services;

public partial class CreditCardInvoiceService(ICreditCardInvoiceRepository creditCardInvoiceRepository,
                                              ICreditCardService creditCardService,
                                              ICreditCardStatementCycleService creditCardStatementCycleService)
    : BaseService<CreditCardInvoiceEntity>(creditCardInvoiceRepository), ICreditCardInvoiceService
{
    public long? ResolveInvoiceForTransaction(long cardId, long userId, DateTime anchorDate)
    {
        var openCycle = ResolveOpenCycle(cardId, userId);
        if (openCycle == null)
            return null;

        int closingDay = openCycle.ClosingDay;
        int dueDay = openCycle.DueDay;
        int dayOfMonth = anchorDate.Day;

        int shift = 0;
        if (dayOfMonth > closingDay) shift += 1;
        if (closingDay >= dueDay) shift += 1;

        var targetMonth = new DateTime(anchorDate.Year, anchorDate.Month, 1).AddMonths(shift);
        string monthKey = targetMonth.ToString("yyyy-MM", CultureInfo.InvariantCulture);

        var firstDay = new DateTime(targetMonth.Year, targetMonth.Month, 1);
        int lastDayOfMonth = DateTime.DaysInMonth(targetMonth.Year, targetMonth.Month);

        var closingDate = firstDay.AddDays(Math.Min(closingDay, lastDayOfMonth) - 1);
        var dueDate = firstDay.AddDays(Math.Min(dueDay, lastDayOfMonth) - 1);

        var existing = creditCardInvoiceRepository.SearchByCardMonth(cardId, monthKey);
        if (existing != null)
            return existing.CreditCardInvoice;

        var entity = new CreditCardInvoiceEntity
        {
            User = userId,
            Card = cardId,
            InvoiceStatus = Constants.InvoiceStatusId.OPEN,
            MonthKey = monthKey,
            ClosingDate = closingDate,
            DueDate = dueDate,
            TotalAmount = 0,
            PaidAmount = 0
        };

        entity.ValidateCreate();

        return creditCardInvoiceRepository.Create(entity);
    }

    public void RecalculateInvoiceTotal(long invoiceId)
    {
        var amounts = creditCardInvoiceRepository.SumInvoiceAmounts(invoiceId);

        long status;
        DateTime? paidAt = null;

        if (amounts.Total > 0 && amounts.Paid >= amounts.Total)
        {
            status = Constants.InvoiceStatusId.PAID;
            paidAt = DateTime.UtcNow;
        }
        else if (amounts.Paid > 0 && amounts.Paid < amounts.Total)
        {
            status = Constants.InvoiceStatusId.PARTIAL;
        }
        else
        {
            status = Constants.InvoiceStatusId.OPEN;
        }

        creditCardInvoiceRepository.UpdateTotals(invoiceId, amounts.Total, amounts.Paid, status, paidAt);
    }

    public void RecalculateInvoiceOwned(long invoiceId, long userId)
    {
        RecalculateInvoiceTotal(GetInvoice(invoiceId, userId).CreditCardInvoice);
    }

    public CreditCardInvoiceEntity GetInvoice(long invoiceId, long userId)
    {
        var invoice = creditCardInvoiceRepository.Search(creditCardInvoice: invoiceId, quantity: 1).FirstOrDefault();
        if (invoice == null)
            throw new ApplicationException(Constants.ErrorMessage.InvoiceNotFound);

        if (invoice.User != userId)
            throw new ApplicationException(Constants.ErrorMessage.AccessDeniedResource);

        return invoice;
    }

    public void ReprocessInvoicesForCard(long cardId, long userId, DateTime fromDate)
    {
        creditCardService.EnsureOwnership(cardId, userId);

        using var tran = GetTransaction();

        var transactionIds = creditCardInvoiceRepository.SearchTransactionIdsToReprocess(cardId, fromDate.Date);

        foreach (var transactionId in transactionIds)
        {
            var anchor = creditCardInvoiceRepository.ResolveTransactionAnchor(transactionId);
            var invoiceId = ResolveInvoiceForTransaction(anchor.Card, userId, anchor.AnchorDate);
            creditCardInvoiceRepository.UpdateTransactionInvoice(transactionId, invoiceId);
        }

        var invoiceIds = creditCardInvoiceRepository.SearchInvoiceIdsByCard(cardId);

        foreach (var invoiceId in invoiceIds)
            RecalculateInvoiceTotal(invoiceId);

        creditCardInvoiceRepository.DeleteUnreferenced(cardId);

        tran.Complete();
    }
}
