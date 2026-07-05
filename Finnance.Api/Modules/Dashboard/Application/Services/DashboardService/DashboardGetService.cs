using Finnance.Api.Modules.Dashboard.Application.Dto;

namespace Finnance.Api.Modules.Dashboard.Application.Services;

public partial class DashboardService
{
    public List<ChartPointDto> GetChartData(long userId, long card, DateTime? start, DateTime? end)
    {
        var chart = dashboardRepository.GetChartData(userId, card, start, end);

        decimal cumulative = 0;
        foreach (var point in chart)
        {
            if (point.Income <= 0 && point.Expense <= 0)
                continue;

            cumulative += point.Income - point.Expense;
            point.CumulativeNet = cumulative;
        }

        return chart;
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
