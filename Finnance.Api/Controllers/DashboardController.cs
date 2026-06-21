using Microsoft.AspNetCore.Mvc;
using Finnance.Api.Modules.Dashboard.Application.Dto;
using Finnance.Api.Modules.Dashboard.Application.Interfaces;
using Finnance.Api.Security;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Controllers;

public class DashboardController(IDashboardService dashboardService) : ControllerBase
{
    [Authorization()]
    [HttpGet]
    public ResultApi<DashboardStatsDto> Stats([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        var stats = dashboardService.GetStats(UserLogged.user, startDate, endDate);
        return new ResultApi<DashboardStatsDto> { Result = stats };
    }

    [Authorization()]
    [HttpGet]
    public ResultApi<List<ChartPointDto>> ChartData([FromQuery] long card, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        var chart = dashboardService.GetChartData(UserLogged.user, card, startDate, endDate);
        return new ResultApi<List<ChartPointDto>> { Result = chart };
    }

    [Authorization()]
    [HttpGet]
    public ResultApi<List<CategoryDistributionDto>> CategoryDistribution([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        var distribution = dashboardService.GetCategoryDistribution(UserLogged.user, startDate, endDate);
        return new ResultApi<List<CategoryDistributionDto>> { Result = distribution };
    }

    [Authorization()]
    [HttpGet]
    public ResultApi<DateTime?> FirstTransactionDate()
    {
        return new ResultApi<DateTime?> { Result = dashboardService.GetFirstTransactionDate(UserLogged.user) };
    }
}
