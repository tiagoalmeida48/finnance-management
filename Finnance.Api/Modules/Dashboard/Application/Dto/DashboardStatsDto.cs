namespace Finnance.Api.Modules.Dashboard.Application.Dto;

public class DashboardStatsDto
{
    public decimal TotalBalance { get; set; }

    public decimal TotalAvailableLimit { get; set; }

    public decimal MonthlyIncome { get; set; }

    public decimal MonthlyExpenses { get; set; }
}
