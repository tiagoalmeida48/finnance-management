using System.Globalization;
using Finnance.Api.Modules.Common.Application.Services;
using Finnance.Api.Modules.RecurringRule.Application.Interfaces;
using Finnance.Api.Modules.RecurringRule.Domain.Entities;
using Finnance.Api.Modules.RecurringRule.Domain.Interfaces;
using Finnance.Api.Modules.Transaction.Application.Dto;
using Finnance.Api.Modules.Transaction.Application.Interfaces;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.RecurringRule.Application.Services;

public partial class RecurringRuleService(IRecurringRuleRepository recurringRuleRepository, ITransactionService transactionService)
    : BaseService<RecurringRuleEntity>(recurringRuleRepository), IRecurringRuleService
{
    public long Create(RecurringRuleEntity entity, long userId)
    {
        entity.User = userId;
        entity.ValidateCreate();
        return recurringRuleRepository.Create(entity);
    }

    public bool Delete(long recurringRule, long userId)
    {
        var current = GetOwned(recurringRule, userId);

        using var tran = GetTransaction();
        recurringRuleRepository.ClearOccurrences(recurringRule, userId);
        var deleted = recurringRuleRepository.Delete(current);
        tran.Complete();

        return deleted;
    }

    public int GenerateOccurrences(long recurringRule, long userId, DateTime until)
    {
        var rule = GetOwned(recurringRule, userId);

        if (until == default)
            throw new ApplicationException(Constants.ErrorMessage.InvalidHorizon);

        var end = until.Date;
        if (rule.DateEnd.Date < end)
            end = rule.DateEnd.Date;

        var existing = recurringRuleRepository.OccurrenceMonths(recurringRule, userId).ToHashSet();
        var frequency = rule.Frequency < 1 ? 1 : rule.Frequency;
        var generated = 0;

        var cursor = new DateTime(rule.DateStart.Year, rule.DateStart.Month, 1);
        var limit = new DateTime(end.Year, end.Month, 1);

        using var tran = GetTransaction();

        while (cursor <= limit)
        {
            var monthKey = cursor.ToString("yyyy-MM", CultureInfo.InvariantCulture);

            if (!existing.Contains(monthKey))
            {
                var day = Math.Min(rule.DayOfMonth, DateTime.DaysInMonth(cursor.Year, cursor.Month));
                var paymentDate = new DateTime(cursor.Year, cursor.Month, day);

                if (paymentDate >= rule.DateStart.Date && paymentDate <= end)
                {
                    transactionService.CreateTransaction(BuildOccurrence(rule, paymentDate), userId);
                    generated++;
                }
            }

            cursor = cursor.AddMonths(frequency);
        }

        tran.Complete();
        return generated;
    }

    private static TransactionCreateDto BuildOccurrence(RecurringRuleEntity rule, DateTime paymentDate)
    {
        return new TransactionCreateDto
        {
            TransactionType = rule.TransactionType,
            Amount = rule.Amount,
            PaymentDate = paymentDate,
            Description = rule.Description,
            Account = rule.Account,
            Card = rule.Card,
            Category = rule.Category,
            PaymentMethod = rule.PaymentMethod,
            IsPaid = false,
            IsFixed = true,
            RecurringRule = rule.RecurringRule
        };
    }
}
