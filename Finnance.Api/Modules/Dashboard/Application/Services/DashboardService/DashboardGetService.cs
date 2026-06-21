using Finnance.Api.Modules.Dashboard.Application.Dto;

namespace Finnance.Api.Modules.Dashboard.Application.Services;

public partial class DashboardService
{
    public List<ChartPointDto> GetChartData(long userId, long card, DateTime? start, DateTime? end)
    {
        return dashboardRepository.GetChartData(userId, card, start, end);
    }

    public List<CategoryDistributionDto> GetCategoryDistribution(long userId, DateTime? start, DateTime? end)
    {
        return dashboardRepository.GetCategoryDistribution(userId, start, end);
    }

    public DateTime? GetFirstTransactionDate(long userId)
    {
        return dashboardRepository.GetFirstTransactionDate(userId);
    }
}
