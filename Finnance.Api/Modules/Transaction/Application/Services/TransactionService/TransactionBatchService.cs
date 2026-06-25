using Finnance.Api.Modules.Transaction.Application.Dto;
using Finnance.Api.Modules.Transaction.Domain.Entities;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.Transaction.Application.Services;

public partial class TransactionService
{
    public bool BatchPay(List<long> ids, long account, DateTime paymentDate, long userId)
    {
        var items = LoadOwnedTransactions(ids, userId);
        EnsureAccountOwnership(account, userId);

        var affected = new HashSet<long>();

        using var tran = GetTransaction();

        foreach (var current in items)
        {
            CollectInvoice(current, affected);
            ApplyBalance(current, -1);

            current.Paid = true;
            current.PaymentDate = paymentDate;
            current.Account = account;

            transactionRepository.UpdateTransaction(current);

            LinkInvoice(current.Transaction, current, userId, affected);
            ApplyBalance(current, 1);
        }

        RecalcInvoices(affected);

        tran.Complete();
        return true;
    }

    public bool PayBill(long invoice, long account, DateTime paymentDate, long userId)
    {
        if (invoice <= 0)
            throw new ApplicationException(Constants.ErrorMessage.InvoiceNotFound);

        var invoiceEntity = creditCardInvoiceService.GetInvoice(invoice, userId);
        bankAccountService.Get(account, userId);

        var ids = transactionRepository.SearchUnpaidIdsByInvoice(invoice, userId);
        if (ids.Count == 0)
            return true;

        var items = transactionRepository.GetByIds(ids, userId);
        var billTotal = items.Sum(item => item.Amount ?? 0);

        using var tran = GetTransaction();

        foreach (var current in items)
        {
            current.Paid = true;
            transactionRepository.UpdateTransaction(current);
        }

        var payment = new TransactionEntity
        {
            User = userId,
            TransactionType = Constants.TransactionTypeId.EXPENSE,
            Amount = billTotal,
            PaymentDate = paymentDate,
            Description = $"Pgto Fatura {invoiceEntity.MonthKey}",
            Account = account,
            Paid = true
        };

        payment.ValidateCreate();
        transactionRepository.Insert(payment);
        ApplyBalance(payment, 1);

        creditCardInvoiceService.RecalculateInvoiceTotal(invoice);

        tran.Complete();
        return true;
    }

    public bool BatchUnpay(List<long> ids, long userId)
    {
        var items = LoadOwnedTransactions(ids, userId);
        var affected = new HashSet<long>();

        using var tran = GetTransaction();

        foreach (var current in items)
        {
            CollectInvoice(current, affected);
            ApplyBalance(current, -1);

            current.Paid = false;
            transactionRepository.UpdateTransaction(current);

            ApplyBalance(current, 1);
        }

        RecalcInvoices(affected);

        tran.Complete();
        return true;
    }

    public bool BatchDelete(List<long> ids, long userId)
    {
        var items = LoadOwnedTransactions(ids, userId);
        var affected = new HashSet<long>();

        using var tran = GetTransaction();

        foreach (var current in items)
        {
            CollectInvoice(current, affected);
            ApplyBalance(current, -1);
            transactionRepository.DeleteById(current.Transaction, userId);
        }

        RecalcInvoices(affected);

        tran.Complete();
        return true;
    }

    public bool BatchChangeDay(List<long> ids, int day, long userId)
    {
        var items = LoadOwnedTransactions(ids, userId);
        var clamped = Math.Max(1, Math.Min(31, day));
        var affected = new HashSet<long>();

        using var tran = GetTransaction();

        foreach (var current in items)
        {
            if (current.PaymentDate is null)
                continue;

            CollectInvoice(current, affected);

            var newPaymentDate = ShiftDay(current.PaymentDate.Value, clamped);
            var newPurchaseDate = current.PurchaseDate.HasValue
                ? ShiftDay(current.PurchaseDate.Value, clamped)
                : (DateTime?)null;

            if (newPaymentDate == current.PaymentDate && newPurchaseDate == current.PurchaseDate)
                continue;

            ApplyBalance(current, -1);

            current.PaymentDate = newPaymentDate;
            current.PurchaseDate = newPurchaseDate;

            transactionRepository.UpdateTransaction(current);

            LinkInvoice(current.Transaction, current, userId, affected);
            ApplyBalance(current, 1);
        }

        RecalcInvoices(affected);

        tran.Complete();
        return true;
    }

    public long InsertInstallmentBetween(long transaction, long userId)
    {
        var selected = GetById(transaction, userId);

        if (selected.InstallmentGroup is null or <= 0)
            throw new ApplicationException(Constants.ErrorMessage.TransactionNotInstallment);

        var groupId = selected.InstallmentGroup.Value;
        var currentTotal = (int)(transactionRepository.MaxGroupTotal(groupId, userId) ?? 0);
        var selectedNumber = selected.InstallmentNumber ?? 0;

        var insertionNumber = Math.Min(selectedNumber + 1, currentTotal + 1);
        var newTotal = currentTotal + 1;
        var baseDescription = StripSuffix(selected.Description);

        var affected = new HashSet<long>();

        using var tran = GetTransaction();

        var siblings = transactionRepository.SearchByGroup(groupId, "installment_group", userId);
        var existingAtInsertion = siblings.FirstOrDefault(s => s.InstallmentNumber == insertionNumber);

        var newPaymentDate = existingAtInsertion?.PaymentDate ?? AddMonths(selected.PaymentDate, 1);
        var newPurchaseDate = existingAtInsertion?.PurchaseDate ?? AddMonths(selected.PurchaseDate, 1);

        foreach (var sibling in siblings.OrderByDescending(s => s.InstallmentNumber ?? 0))
        {
            CollectInvoice(sibling, affected);

            var number = sibling.InstallmentNumber ?? 0;

            if (number >= insertionNumber)
            {
                ApplyBalance(sibling, -1);

                sibling.InstallmentNumber = number + 1;
                sibling.PaymentDate = AddMonths(sibling.PaymentDate, 1);
                sibling.PurchaseDate = AddMonths(sibling.PurchaseDate, 1);
                sibling.Description = BuildInstallmentDescription(baseDescription, number + 1, newTotal);

                transactionRepository.UpdateTransaction(sibling);

                LinkInvoice(sibling.Transaction, sibling, userId, affected);
                ApplyBalance(sibling, 1);
            }
            else
            {
                sibling.Description = BuildInstallmentDescription(baseDescription, number, newTotal);
                transactionRepository.UpdateTransaction(sibling);
            }
        }

        transactionRepository.UpdateGroupTotal(groupId, newTotal, userId);

        var inserted = new TransactionEntity
        {
            User = userId,
            TransactionType = selected.TransactionType,
            PaymentMethod = selected.PaymentMethod,
            Amount = selected.Amount,
            PaymentDate = newPaymentDate,
            PurchaseDate = newPurchaseDate,
            Description = BuildInstallmentDescription(baseDescription, insertionNumber, newTotal),
            Account = selected.Account,
            ToAccount = selected.ToAccount,
            Card = selected.Card,
            Category = selected.Category,
            Notes = selected.Notes,
            Paid = false,
            Fixed = false,
            InstallmentGroup = groupId,
            InstallmentNumber = insertionNumber,
            RecurringGroup = null
        };

        inserted.ValidateCreate();
        var newId = transactionRepository.Insert(inserted);

        LinkInvoice(newId, inserted, userId, affected);
        ApplyBalance(inserted, 1);

        RecalcInvoices(affected);

        tran.Complete();
        return newId;
    }

    public bool DeleteGroup(long groupId, string type, long userId)
    {
        var groupColumn = ResolveGroupColumn(type);
        var items = transactionRepository.SearchByGroup(groupId, groupColumn, userId);

        var affected = new HashSet<long>();

        using var tran = GetTransaction();

        foreach (var current in items)
        {
            CollectInvoice(current, affected);
            ApplyBalance(current, -1);
        }

        transactionRepository.DeleteByGroup(groupId, groupColumn, userId);

        RecalcInvoices(affected);

        tran.Complete();
        return true;
    }

    public List<long> UpdateGroup(UpdateGroupDto updates, long userId)
    {
        var groupColumn = ResolveGroupColumn(updates.Type);
        var isInstallment = updates.Type == Constants.GroupType.Installment;
        var items = transactionRepository.SearchByGroup(updates.GroupId, groupColumn, userId);

        var total = items.Count;
        var changedIds = new List<long>();
        var affected = new HashSet<long>();

        using var tran = GetTransaction();

        foreach (var current in items)
        {
            CollectInvoice(current, affected);

            ApplyBalance(current, -1);

            var relink = ApplyGroupUpdate(current, updates, isInstallment, total);

            current.ValidateUpdate();
            transactionRepository.UpdateTransaction(current);
            changedIds.Add(current.Transaction);

            if (relink)
                LinkInvoice(current.Transaction, current, userId, affected);
            else
                CollectInvoice(current, affected);

            ApplyBalance(current, 1);
        }

        RecalcInvoices(affected);

        tran.Complete();
        return changedIds;
    }

    private static bool ApplyGroupUpdate(TransactionEntity current, UpdateGroupDto updates, bool isInstallment, int total)
    {
        var relink = false;

        if (updates.Amount.HasValue)
            current.Amount = updates.Amount.Value;

        if (updates.Category is > 0)
            current.Category = updates.Category;

        if (updates.PaymentMethod is > 0)
            current.PaymentMethod = updates.PaymentMethod;

        if (updates.PaymentDate.HasValue && current.PaymentDate.HasValue)
        {
            current.PaymentDate = ShiftDay(current.PaymentDate.Value, updates.PaymentDate.Value.Day);
            relink = true;
        }

        if (updates.ClearPurchaseDate)
        {
            current.PurchaseDate = null;
            relink = true;
        }
        else if (updates.PurchaseDate.HasValue && current.PurchaseDate.HasValue)
        {
            current.PurchaseDate = ShiftDay(current.PurchaseDate.Value, updates.PurchaseDate.Value.Day);
            relink = true;
        }

        if (updates.Description != null)
        {
            if (isInstallment)
            {
                var number = current.InstallmentNumber ?? 0;
                current.Description = BuildInstallmentDescription(updates.Description, number, total);
            }
            else
            {
                current.Description = updates.Description;
            }
        }

        return relink;
    }

    private static DateTime ShiftDay(DateTime date, int day)
    {
        var clamped = Math.Max(1, Math.Min(31, day));
        var firstDay = new DateTime(date.Year, date.Month, 1);
        var lastDayOfMonth = DateTime.DaysInMonth(date.Year, date.Month);
        return firstDay.AddDays(Math.Min(clamped, lastDayOfMonth) - 1);
    }

    private static string ResolveGroupColumn(string type)
    {
        return type switch
        {
            Constants.GroupType.Installment => "installment_group",
            Constants.GroupType.Recurring => "recurring_group",
            _ => throw new ApplicationException(Constants.ErrorMessage.InvalidGroupType)
        };
    }

    private static void CollectInvoice(TransactionEntity tx, HashSet<long> affected)
    {
        if (tx.Invoice is > 0)
            affected.Add(tx.Invoice.Value);
    }

    private List<TransactionEntity> LoadOwnedTransactions(List<long> ids, long userId)
    {
        var items = transactionRepository.GetByIds(ids ?? [], userId);
        return items;
    }
}
