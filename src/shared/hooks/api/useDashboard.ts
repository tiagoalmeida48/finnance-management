import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/shared/services/dashboard.service";
import { queryKeys } from "@/shared/constants/queryKeys";

type DashboardFilter = Date | { start: string; end: string };

export function useDashboardStats(filter?: DashboardFilter) {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(filter),
    queryFn: () => dashboardService.getStats(filter),
  });
}

export function useDashboardCharts(filter?: DashboardFilter) {
  return useQuery({
    queryKey: queryKeys.dashboard.charts(filter),
    queryFn: () => dashboardService.getChartData(filter),
  });
}

export function useDashboardCategories(filter?: DashboardFilter) {
  return useQuery({
    queryKey: queryKeys.dashboard.categories(filter),
    queryFn: () => dashboardService.getCategoryDistribution(filter),
  });
}
