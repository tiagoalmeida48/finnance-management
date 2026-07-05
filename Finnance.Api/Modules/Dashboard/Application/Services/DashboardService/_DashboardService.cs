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

        var stats = new DashboardStatsDto
        {
            TotalBalance = dashboardRepository.GetTotalBalance(userId),
            TotalAvailableLimit = dashboardRepository.GetTotalAvailableLimit(userId),
            MonthlyIncome = dashboardRepository.GetMonthlyIncome(userId, start, end) + baseIncome,
            MonthlyExpenses = dashboardRepository.GetMonthlyExpenses(userId, start, end)
        };

        var nets = dashboardRepository.GetChartData(userId, 0, start, end)
            .Where(point => point.Income > 0 || point.Expense > 0)
            .Select(point => point.Income - point.Expense)
            .ToList();

        var monthCount = Math.Max(nets.Count, 1);

        stats.NetFlowDelta = nets.Count > 1 ? nets[^1] - nets[^2] : 0;
        stats.HasNetHistory = nets.Count > 1;
        stats.AvgMonthlyIncome = Math.Round(stats.MonthlyIncome / monthCount, 2);
        stats.AvgMonthlyExpenses = Math.Round(stats.MonthlyExpenses / monthCount, 2);

        return stats;
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
