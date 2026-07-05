using Finnance.Api.Modules.Transaction.Application.Dto;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.Transaction.Application.Services;

public partial class TransactionService
{
    public List<TrackingMonthDto> GetMonthlyTracking(int year, long userId)
    {
        var fixedExpenses = transactionRepository.SearchFixedExpensesByYear(year, userId);
        var invoices = creditCardInvoiceService.ListByYear(year, userId);
        var cards = creditCardService.List(userId).ToDictionary(c => c.CreditCard);

        var result = new List<TrackingMonthDto>();

        for (var month = 1; month <= 12; month++)
        {
            var monthKey = $"{year}-{month:00}";
            var items = new List<TrackingItemDto>();

            items.AddRange(fixedExpenses
                .Where(t => t.PaymentDate.HasValue && t.PaymentDate.Value.Month == month)
                .Select(t => new TrackingItemDto
                {
                    Id = t.Transaction,
                    ItemType = "fixed",
                    Name = t.Description,
                    Total = t.Amount ?? 0,
                    IsPaid = t.Paid,
                    Account = t.Account
                }));

            items.AddRange(invoices
                .Where(i => i.MonthKey == monthKey && i.TotalAmount > 0)
                .Select(i =>
                {
                    cards.TryGetValue(i.Card, out var card);
                    return new TrackingItemDto
                    {
                        Id = i.CreditCardInvoice,
                        ItemType = "card",
                        Name = $"Fatura {card?.Name ?? "Cartão"}",
                        Total = i.TotalAmount,
                        IsPaid = i.InvoiceStatus == Constants.InvoiceStatusId.PAID,
                        Account = card?.BankAccount
                    };
                }));

            var paidItems = items.Count(i => i.IsPaid);

            result.Add(new TrackingMonthDto
            {
                Month = month,
                Items = items,
                TotalItems = items.Count,
                PaidItems = paidItems,
                Progress = items.Count > 0 ? Math.Round(paidItems * 100m / items.Count, 2) : 0,
                TotalAmount = items.Sum(i => i.Total)
            });
        }

        return result;
    }
}
