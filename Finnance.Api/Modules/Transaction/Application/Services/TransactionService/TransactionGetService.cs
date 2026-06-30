using Finnance.Api.Modules.Transaction.Application.Dto;
using Finnance.Api.Modules.Transaction.Domain.Entities;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.Transaction.Application.Services;

public partial class TransactionService
{
    private const string ImportTemplateCsv =
        "Data;Descrição;Valor;Categoria;Notas\n" +
        "05/06/2026;Salário;5000,00;Salário;Receita (valor positivo)\n" +
        "12/06/2026;Mercado;-350,90;Alimentação;Despesa (valor negativo)\n";

    public string GetImportTemplate()
    {
        return ImportTemplateCsv;
    }

    public TransactionEntity GetById(long transaction, long userId)
    {
        var current = transactionRepository.GetById(transaction, userId);
        if (current == null)
            throw new ApplicationException(Constants.ErrorMessage.TransactionNotFound);

        return current;
    }

    public List<TransactionEntity> GetByIds(List<long> ids, long userId)
    {
        return transactionRepository.GetByIds(ids ?? [], userId);
    }

    public List<TransactionEntity> GetPaginated(TransactionFilterDto filter, long userId)
    {
        filter ??= new TransactionFilterDto();

        return transactionRepository.GetPaginated(userId,
                                                  filter.MapTo<TransactionQuery>(),
                                                  filter.SortAsc,
                                                  filter.SortField,
                                                  filter.Limit,
                                                  filter.Offset);
    }

    public TransactionListResultDto GetGroupedPaginated(TransactionFilterDto filter, long userId)
    {
        filter ??= new TransactionFilterDto();

        var rows = transactionRepository.GetForGrouping(userId,
                                                        filter.MapTo<TransactionQuery>(),
                                                        filter.SortAsc,
                                                        filter.SortField);

        var installmentIds = rows
            .Where(r => r.InstallmentGroup is > 0)
            .Select(r => r.InstallmentGroup.Value)
            .Distinct()
            .ToList();

        var recurringIds = rows
            .Where(r => r.InstallmentGroup is null or <= 0 && r.RecurringGroup is > 0)
            .Select(r => r.RecurringGroup.Value)
            .Distinct()
            .ToList();

        var groupRows = installmentIds.Count > 0 || recurringIds.Count > 0
            ? transactionRepository.GetByGroupIds(installmentIds, recurringIds, userId)
            : [];

        var items = SortGroupedItems(BuildGroupedItems(rows, groupRows), filter.SortField, filter.SortAsc);

        var totalLines = items.Count;
        var offset = filter.Offset < 0 ? 0 : filter.Offset;
        var limit = filter.Limit <= 0 ? Constants.MaxPageSizeLimit : filter.Limit;

        return new TransactionListResultDto
        {
            Items = items.Skip(offset).Take(limit).ToList(),
            TotalLines = totalLines,
            HasNextPage = offset + limit < totalLines
        };
    }

    private static List<TransactionListItemDto> BuildGroupedItems(List<TransactionEntity> rows, List<TransactionEntity> groupRows)
    {
        var result = new List<TransactionListItemDto>();

        var installmentGroups = rows
            .Where(r => r.InstallmentGroup is > 0)
            .Select(r => r.InstallmentGroup.Value)
            .Distinct();

        foreach (var groupId in installmentGroups)
        {
            var groupItems = groupRows.Where(r => r.InstallmentGroup == groupId).ToList();
            if (groupItems.Count > 0)
                result.Add(new TransactionListItemDto { IsGroup = true, Group = BuildGroup(groupId, "installment", groupItems) });
        }

        var recurringGroups = rows
            .Where(r => r.InstallmentGroup is null or <= 0 && r.RecurringGroup is > 0)
            .Select(r => r.RecurringGroup.Value)
            .Distinct();

        foreach (var groupId in recurringGroups)
        {
            var groupItems = groupRows.Where(r => (r.InstallmentGroup is null or <= 0) && r.RecurringGroup == groupId).ToList();
            if (groupItems.Count > 0)
                result.Add(new TransactionListItemDto { IsGroup = true, Group = BuildGroup(groupId, "recurring", groupItems) });
        }

        var singles = rows.Where(r => r.InstallmentGroup is null or <= 0 && r.RecurringGroup is null or <= 0);

        foreach (var single in singles)
            result.Add(new TransactionListItemDto { IsGroup = false, Transaction = single.MapTo<TransactionDisplayDto>() });

        return result;
    }

    private static TransactionGroupDto BuildGroup(long groupId, string type, List<TransactionEntity> rows)
    {
        var ordered = type == "installment"
            ? rows.OrderBy(r => r.InstallmentNumber ?? int.MaxValue).ThenBy(r => r.PaymentDate ?? DateTime.MaxValue).ToList()
            : rows.OrderBy(r => r.PaymentDate ?? DateTime.MaxValue).ToList();

        var items = ordered.MapTo<List<TransactionDisplayDto>>();
        var mainIndex = ordered.FindIndex(r => !r.Paid);
        if (mainIndex < 0)
            mainIndex = 0;
        var main = items[mainIndex];

        var totalItems = ordered.Count;
        var paidItems = ordered.Count(r => r.Paid);
        var totalAmount = ordered.Sum(r => r.Amount ?? 0m);
        var paidAmount = ordered.Where(r => r.Paid).Sum(r => r.Amount ?? 0m);

        var totalInstallments = type == "installment"
            ? ordered.Select(r => r.TotalInstallments).FirstOrDefault(t => t.HasValue) ?? totalItems
            : totalItems;

        return new TransactionGroupDto
        {
            GroupId = groupId,
            Type = type,
            TotalInstallments = totalInstallments,
            TotalItemsCount = totalItems,
            PaidItemsCount = paidItems,
            PaidItemsPercent = totalItems == 0 ? 0 : (int)Math.Round(paidItems / (double)totalItems * 100, MidpointRounding.AwayFromZero),
            TotalAmount = totalAmount,
            PaidAmount = paidAmount,
            IsAllPaid = totalItems > 0 && paidItems == totalItems,
            Category = main.Category,
            Description = main.Description,
            MainTransaction = main,
            Items = items
        };
    }

    private static List<TransactionListItemDto> SortGroupedItems(List<TransactionListItemDto> items, string sortField, bool asc)
    {
        var field = string.IsNullOrWhiteSpace(sortField) ? "payment_date" : sortField.Trim().ToLowerInvariant();

        return field switch
        {
            "amount" => OrderItems(items, i => Representative(i).Amount ?? 0m, asc),
            "paid" => OrderItems(items, i => Representative(i).Paid, asc),
            "payment_method" => OrderItems(items, i => Representative(i).PaymentMethod ?? 0, asc),
            "description" => OrderItems(items, i => Representative(i).Description ?? string.Empty, asc),
            "transaction_type" => OrderItems(items, i => Representative(i).TransactionType, asc),
            "purchase_date" => OrderItems(items, i => Representative(i).PurchaseDate ?? DateTime.MinValue, asc),
            _ => OrderItems(items, i => Representative(i).PaymentDate ?? DateTime.MinValue, asc)
        };
    }

    private static TransactionDisplayDto Representative(TransactionListItemDto item)
    {
        return item.IsGroup ? item.Group.MainTransaction : item.Transaction;
    }

    private static List<TransactionListItemDto> OrderItems<TKey>(List<TransactionListItemDto> items, Func<TransactionListItemDto, TKey> key, bool asc)
    {
        return (asc ? items.OrderBy(key) : items.OrderByDescending(key)).ToList();
    }

    public TransactionSummaryDto GetSummary(TransactionFilterDto filter, long userId)
    {
        filter ??= new TransactionFilterDto();

        var totals = transactionRepository.GetSummary(userId, filter.MapTo<TransactionQuery>());

        return new TransactionSummaryDto
        {
            Income = totals.Income,
            Expense = totals.Expense,
            Pending = totals.Pending
        };
    }
}
