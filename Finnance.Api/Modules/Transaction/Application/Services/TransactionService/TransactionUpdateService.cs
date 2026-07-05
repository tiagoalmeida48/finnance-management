using Finnance.Api.Modules.Transaction.Application.Dto;
using Finnance.Api.Modules.Transaction.Domain.Entities;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.Transaction.Application.Services;

public partial class TransactionService
{
    public bool UpdateTransaction(TransactionUpdateDto patch, long userId)
    {
        var current = GetById(patch.Transaction, userId);

        var affected = new HashSet<long>();
        if (current.Invoice is > 0)
            affected.Add(current.Invoice.Value);

        using var tran = GetTransaction();

        ApplyBalance(current, -1);

        var relinkInvoice = ApplyPatch(current, patch);

        current.ValidateUpdate();
        transactionRepository.UpdateTransaction(current);

        if (relinkInvoice)
            LinkInvoice(current.Transaction, current, userId, affected);
        else if (current.Invoice is > 0)
            affected.Add(current.Invoice.Value);

        ApplyBalance(current, 1);

        RecalcInvoices(affected, userId);

        tran.Complete();
        return true;
    }

    public bool TogglePaid(long transaction, long userId)
    {
        var current = GetById(transaction, userId);

        var patch = new TransactionUpdateDto
        {
            Transaction = transaction,
            Paid = !current.Paid
        };

        return UpdateTransaction(patch, userId);
    }

    public bool DeleteTransaction(long transaction, long userId)
    {
        var current = GetById(transaction, userId);

        var affected = new HashSet<long>();
        if (current.Invoice is > 0)
            affected.Add(current.Invoice.Value);

        using var tran = GetTransaction();

        ApplyBalance(current, -1);
        transactionRepository.DeleteById(transaction, userId);

        RecalcInvoices(affected, userId);

        tran.Complete();
        return true;
    }

    public long Duplicate(long transaction, long userId)
    {
        var current = GetById(transaction, userId);

        var input = new TransactionCreateDto
        {
            TransactionType = current.TransactionType,
            Amount = current.Amount ?? 0,
            PaymentDate = current.PaymentDate,
            PurchaseDate = current.PurchaseDate,
            Description = $"{StripSuffix(current.Description)} (copia)",
            Account = current.Account,
            ToAccount = current.ToAccount,
            Card = current.Card,
            Category = current.Category,
            PaymentMethod = current.PaymentMethod,
            Notes = current.Notes,
            IsPaid = false,
            IsFixed = false,
            IsInstallment = false,
            TotalInstallments = 1,
            RepeatCount = 1
        };

        var result = CreateTransaction(input, userId);
        return result.Id;
    }

    private static bool ApplyPatch(TransactionEntity current, TransactionUpdateDto patch)
    {
        var relinkInvoice = false;

        if (patch.TransactionType.HasValue)
            current.TransactionType = patch.TransactionType.Value;

        if (patch.Amount.HasValue)
            current.Amount = patch.Amount.Value;

        if (patch.PaymentDate.HasValue)
        {
            current.PaymentDate = patch.PaymentDate.Value;
            relinkInvoice = true;
        }

        if (patch.ClearPurchaseDate)
        {
            current.PurchaseDate = null;
            relinkInvoice = true;
        }
        else if (patch.PurchaseDate.HasValue)
        {
            current.PurchaseDate = patch.PurchaseDate.Value;
            relinkInvoice = true;
        }

        if (patch.Description != null)
            current.Description = patch.Description;

        if (patch.Paid.HasValue)
            current.Paid = patch.Paid.Value;

        if (patch.Fixed.HasValue)
            current.Fixed = patch.Fixed.Value;

        if (patch.ClearAccount)
            current.Account = null;
        else if (patch.Account is > 0)
            current.Account = patch.Account;

        if (patch.ClearToAccount)
            current.ToAccount = null;
        else if (patch.ToAccount is > 0)
            current.ToAccount = patch.ToAccount;

        if (patch.ClearCategory)
            current.Category = null;
        else if (patch.Category is > 0)
            current.Category = patch.Category;

        if (patch.ClearCard)
        {
            current.Card = null;
            relinkInvoice = true;
        }
        else if (patch.Card is > 0)
        {
            current.Card = patch.Card;
            relinkInvoice = true;
        }

        if (patch.ClearPaymentMethod)
            current.PaymentMethod = null;
        else if (patch.PaymentMethod is > 0)
            current.PaymentMethod = patch.PaymentMethod;

        if (patch.Notes != null)
            current.Notes = patch.Notes;

        if (current.Card is > 0 && current.PurchaseDate is null && current.PaymentDate.HasValue)
        {
            current.PurchaseDate = current.PaymentDate;
            relinkInvoice = true;
        }

        return relinkInvoice;
    }
}
