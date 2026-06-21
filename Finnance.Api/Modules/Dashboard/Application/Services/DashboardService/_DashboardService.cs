using Finnance.Api.Modules.Common.Application.Services;
using Finnance.Api.Modules.Dashboard.Application.Dto;
using Finnance.Api.Modules.Dashboard.Application.Interfaces;
using Finnance.Api.Modules.Dashboard.Domain.Entities;
using Finnance.Api.Modules.Dashboard.Domain.Interfaces;

namespace Finnance.Api.Modules.Dashboard.Application.Services;

public partial class DashboardService(IDashboardRepository dashboardRepository)
    : BaseService<DashboardEntity>(dashboardRepository), IDashboardService
{
    public DashboardStatsDto GetStats(long userId, DateTime? start, DateTime? end)
    {
        var baseIncome = ResolveBaseIncome(userId, start);

        return new DashboardStatsDto
        {
            TotalBalance = dashboardRepository.GetTotalBalance(userId),
            TotalAvailableLimit = dashboardRepository.GetTotalAvailableLimit(userId),
            MonthlyIncome = dashboardRepository.GetMonthlyIncome(userId, start, end) + baseIncome,
            MonthlyExpenses = dashboardRepository.GetMonthlyExpenses(userId, start, end)
        };
    }

    private decimal ResolveBaseIncome(long userId, DateTime? start)
    {
        if (!start.HasValue)
            return dashboardRepository.GetInitialBalanceSum(userId);

        var firstTransaction = dashboardRepository.GetFirstTransactionDate(userId);
        if (!firstTransaction.HasValue)
            return 0;

        var filterMonth = new DateTime(start.Value.Year, start.Value.Month, 1);
        var firstMonth = new DateTime(firstTransaction.Value.Year, firstTransaction.Value.Month, 1);

        if (filterMonth <= firstMonth)
            return dashboardRepository.GetInitialBalanceSum(userId);

        return 0;
    }
}
