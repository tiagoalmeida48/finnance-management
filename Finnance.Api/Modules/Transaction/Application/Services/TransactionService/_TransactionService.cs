using Finnance.Api.Modules.BankAccount.Application.Interfaces;
using Finnance.Api.Modules.Category.Application.Interfaces;
using Finnance.Api.Modules.Common.Application.Services;
using Finnance.Api.Modules.CreditCard.Application.Interfaces;
using Finnance.Api.Modules.CreditCardInvoice.Application.Interfaces;
using Finnance.Api.Modules.InstallmentGroup.Application.Interfaces;
using Finnance.Api.Modules.InstallmentGroup.Domain.Entities;
using Finnance.Api.Modules.RecurringGroup.Application.Interfaces;
using Finnance.Api.Modules.RecurringGroup.Domain.Entities;
using Finnance.Api.Modules.Transaction.Application.Dto;
using Finnance.Api.Modules.Transaction.Application.Interfaces;
using Finnance.Api.Modules.Transaction.Domain.Entities;
using Finnance.Api.Modules.Transaction.Domain.Interfaces;
using System.Globalization;
using System.Text.RegularExpressions;

namespace Finnance.Api.Modules.Transaction.Application.Services;

public partial class TransactionService(ITransactionRepository transactionRepository,
                                        IInstallmentGroupService installmentGroupService,
                                        IRecurringGroupService recurringGroupService,
                                        ICreditCardInvoiceService creditCardInvoiceService,
                                        IBankAccountService bankAccountService,
                                        ICreditCardService creditCardService,
                                        ICategoryService categoryService)
    : BaseService<TransactionEntity>(transactionRepository), ITransactionService
{
    private static readonly Regex InstallmentSuffix = new(@"\s*\(\s*\d+\s*/\s*\d+\s*\)\s*$", RegexOptions.IgnoreCase);

    public (long Id, long? GroupId) CreateTransaction(TransactionCreateDto input, long userId)
    {
        ValidateCreateInput(input, userId);

        using var tran = GetTransaction();

        (long Id, long? GroupId) result;

        if (input.IsInstallment || input.TotalInstallments > 1)
            result = CreateInstallmentBranch(input, userId);
        else if (input.IsFixed && input.RepeatCount > 1)
            result = CreateRecurringBranch(input, userId);
        else
            result = CreateSimpleBranch(input, userId);

        tran.Complete();
        return result;
    }

    private (long Id, long? GroupId) CreateInstallmentBranch(TransactionCreateDto input, long userId)
    {
        var total = input.TotalInstallments < 1 ? 1 : input.TotalInstallments;

        var group = new InstallmentGroupEntity { TotalInstallments = total };
        var groupId = installmentGroupService.Create(group, userId);

        var baseDescription = StripSuffix(input.Description);
        var affected = new HashSet<long>();
        long lastId = 0;

        for (var i = 1; i <= total; i++)
        {
            var entity = BuildBaseEntity(input, userId);
            entity.Amount = ResolveInstallmentAmount(input, i);
            entity.PaymentDate = AddMonths(input.PaymentDate, i - 1);
            entity.PurchaseDate = AddMonths(input.PurchaseDate, i - 1);
            entity.Description = BuildInstallmentDescription(baseDescription, i, total);
            entity.Paid = false;
            entity.Fixed = false;
            entity.InstallmentGroup = groupId;
            entity.InstallmentNumber = i;
            entity.RecurringGroup = null;

            entity.ValidateCreate();
            lastId = transactionRepository.Insert(entity);

            LinkInvoice(lastId, entity, userId, affected);
            ApplyBalance(entity, 1);
        }

        RecalcInvoices(affected);
        return (lastId, groupId);
    }

    private (long Id, long? GroupId) CreateRecurringBranch(TransactionCreateDto input, long userId)
    {
        var repeat = input.RepeatCount < 1 ? 1 : input.RepeatCount;

        var group = new RecurringGroupEntity();
        var groupId = recurringGroupService.Create(group, userId);

        var affected = new HashSet<long>();
        long lastId = 0;

        for (var i = 0; i < repeat; i++)
        {
            var entity = BuildBaseEntity(input, userId);
            entity.PaymentDate = AddMonths(input.PaymentDate, i);
            entity.PurchaseDate = AddMonths(input.PurchaseDate, i);
            entity.Paid = false;
            entity.Fixed = true;
            entity.RecurringGroup = groupId;
            entity.InstallmentGroup = null;

            entity.ValidateCreate();
            lastId = transactionRepository.Insert(entity);

            LinkInvoice(lastId, entity, userId, affected);
            ApplyBalance(entity, 1);
        }

        RecalcInvoices(affected);
        return (lastId, groupId);
    }

    private (long Id, long? GroupId) CreateSimpleBranch(TransactionCreateDto input, long userId)
    {
        var entity = BuildBaseEntity(input, userId);
        entity.RecurringGroup = input.IsFixed ? input.RecurringGroup : null;

        entity.ValidateCreate();
        var id = transactionRepository.Insert(entity);

        var affected = new HashSet<long>();
        LinkInvoice(id, entity, userId, affected);
        ApplyBalance(entity, 1);
        RecalcInvoices(affected);

        return (id, null);
    }

    private static TransactionEntity BuildBaseEntity(TransactionCreateDto input, long userId)
    {
        return new TransactionEntity
        {
            User = userId,
            TransactionType = input.TransactionType,
            PaymentMethod = input.PaymentMethod,
            Amount = input.Amount,
            PaymentDate = input.PaymentDate,
            PurchaseDate = input.PurchaseDate,
            Description = input.Description,
            Account = input.Account,
            ToAccount = input.ToAccount,
            Card = input.Card,
            Category = input.Category,
            Notes = input.Notes,
            Paid = input.IsPaid,
            Fixed = input.IsFixed
        };
    }

    private static decimal ResolveInstallmentAmount(TransactionCreateDto input, int number)
    {
        if (input.InstallmentAmounts != null && input.InstallmentAmounts.Count >= number)
            return input.InstallmentAmounts[number - 1];

        return input.Amount;
    }

    private static DateTime? AddMonths(DateTime? date, int months)
    {
        return date?.AddMonths(months);
    }

    private static string StripSuffix(string description)
    {
        return description == null ? null : InstallmentSuffix.Replace(description, string.Empty);
    }

    private static string BuildInstallmentDescription(string baseDescription, int number, int total)
    {
        var numberPart = number.ToString(CultureInfo.InvariantCulture).PadLeft(2, '0');
        var totalPart = total.ToString(CultureInfo.InvariantCulture).PadLeft(2, '0');
        return $"{baseDescription} ({numberPart}/{totalPart})";
    }
}
