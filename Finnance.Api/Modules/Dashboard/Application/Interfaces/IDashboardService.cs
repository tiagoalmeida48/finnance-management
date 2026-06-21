using Finnance.Api.Modules.Common.Application.Interfaces;
using Finnance.Api.Modules.Dashboard.Application.Dto;
using Finnance.Api.Modules.Dashboard.Domain.Entities;

namespace Finnance.Api.Modules.Dashboard.Application.Interfaces;

public interface IDashboardService : IBaseService<DashboardEntity>
{
    DashboardStatsDto GetStats(long userId, DateTime? start, DateTime? end);

    List<ChartPointDto> GetChartData(long userId, long card, DateTime? start, DateTime? end);

    List<CategoryDistributionDto> GetCategoryDistribution(long userId, DateTime? start, DateTime? end);

    DateTime? GetFirstTransactionDate(long userId);
}
