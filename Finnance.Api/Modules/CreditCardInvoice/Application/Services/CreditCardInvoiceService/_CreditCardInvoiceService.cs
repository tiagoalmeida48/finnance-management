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

        var existing = creditCardInvoiceRepository.SearchByCardMonth(cardId, userId, monthKey);
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

    public void RecalculateInvoiceTotal(long invoiceId, long userId)
    {
        var amounts = creditCardInvoiceRepository.SumInvoiceAmounts(invoiceId, userId);
        var paid = amounts.Paid + creditCardInvoiceRepository.SumPayments(invoiceId, userId);

        if (amounts.Total > 0 && paid > amounts.Total)
            paid = amounts.Total;

        long status;
        DateTime? paidAt = null;

        if (amounts.Total > 0 && paid >= amounts.Total)
        {
            status = Constants.InvoiceStatusId.PAID;
            paidAt = DateTime.UtcNow;
        }
        else if (paid > 0 && paid < amounts.Total)
        {
            status = Constants.InvoiceStatusId.PARTIAL;
        }
        else
        {
            status = Constants.InvoiceStatusId.OPEN;
        }

        creditCardInvoiceRepository.UpdateTotals(invoiceId, userId, amounts.Total, paid, status, paidAt);
    }

    public void RecalculateInvoiceOwned(long invoiceId, long userId)
    {
        RecalculateInvoiceTotal(GetInvoice(invoiceId, userId).CreditCardInvoice, userId);
    }

    public int MarkOverdueInvoices(long userId)
    {
        using var tran = GetTransaction();
        var count = creditCardInvoiceRepository.MarkOverdue(userId);
        tran.Complete();
        return count;
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

        var transactionIds = creditCardInvoiceRepository.SearchTransactionIdsToReprocess(cardId, userId, fromDate.Date);

        foreach (var transactionId in transactionIds)
        {
            var anchor = creditCardInvoiceRepository.ResolveTransactionAnchor(transactionId, userId);
            var invoiceId = ResolveInvoiceForTransaction(anchor.Card, userId, anchor.AnchorDate);
            creditCardInvoiceRepository.UpdateTransactionInvoice(transactionId, invoiceId, userId);
        }

        var invoiceIds = creditCardInvoiceRepository.SearchInvoiceIdsByCard(cardId, userId);

        foreach (var invoiceId in invoiceIds)
            RecalculateInvoiceTotal(invoiceId, userId);

        creditCardInvoiceRepository.DeleteUnreferenced(cardId, userId);

        tran.Complete();
    }

    public bool UpdateCycleAndReprocess(long creditCardStatementCycle, long userId, short closingDay, short dueDay, string notes)
    {
        using var tran = GetTransaction();
        var cycle = creditCardStatementCycleService.UpdateCycle(creditCardStatementCycle, userId, closingDay, dueDay, notes);
        ReprocessInvoicesForCard(cycle.Card, userId, cycle.DateStart);
        tran.Complete();
        return true;
    }

    public bool DeleteCycleAndReprocess(long creditCardStatementCycle, long userId)
    {
        using var tran = GetTransaction();
        var deleted = creditCardStatementCycleService.DeleteCycle(creditCardStatementCycle, userId);
        ReprocessInvoicesForCard(deleted.Card, userId, deleted.DateStart);
        tran.Complete();
        return true;
    }

    public long InsertCycleAndReprocess(long card, long userId, DateTime dateStart, short closingDay, short dueDay, string notes)
    {
        using var tran = GetTransaction();
        var id = creditCardStatementCycleService.InsertCycle(card, userId, dateStart, closingDay, dueDay, notes);
        ReprocessInvoicesForCard(card, userId, DateTime.MinValue);
        tran.Complete();
        return id;
    }

    public bool UpdateCycleStartAndReprocess(long creditCardStatementCycle, long userId, DateTime dateStart)
    {
        using var tran = GetTransaction();
        creditCardStatementCycleService.UpdateCycleStart(creditCardStatementCycle, userId, dateStart);
        var cycle = creditCardStatementCycleService.Get(creditCardStatementCycle, userId);
        ReprocessInvoicesForCard(cycle.Card, userId, DateTime.MinValue);
        tran.Complete();
        return true;
    }

    public bool UpdateCycleEndAndReprocess(long creditCardStatementCycle, long userId, DateTime dateEnd)
    {
        using var tran = GetTransaction();
        creditCardStatementCycleService.UpdateCycleEnd(creditCardStatementCycle, userId, dateEnd);
        var cycle = creditCardStatementCycleService.Get(creditCardStatementCycle, userId);
        ReprocessInvoicesForCard(cycle.Card, userId, DateTime.MinValue);
        tran.Complete();
        return true;
    }
}
