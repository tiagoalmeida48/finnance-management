using Finnance.Api.Modules.Common.Domain.Interfaces;
using Finnance.Api.Modules.Dashboard.Application.Dto;
using Finnance.Api.Modules.Dashboard.Domain.Entities;

namespace Finnance.Api.Modules.Dashboard.Domain.Interfaces;

public interface IDashboardRepository : IBaseRepository<DashboardEntity>
{
    decimal GetTotalBalance(long user);

    decimal GetTotalAvailableLimit(long user);

    decimal GetMonthlyIncome(long user, DateTime? start, DateTime? end);

    decimal GetMonthlyExpenses(long user, DateTime? start, DateTime? end);

    decimal GetInitialBalanceSum(long user);

    DateTime? GetFirstTransactionDate(long user);

    List<ChartPointDto> GetChartData(long user, long card, DateTime? start, DateTime? end);

    List<CategoryDistributionDto> GetCategoryDistribution(long user, DateTime? start, DateTime? end);
}
