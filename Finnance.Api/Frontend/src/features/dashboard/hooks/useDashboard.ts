import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';
import type { DashboardPeriod } from '../types/dashboard.types';

export const dashboardKeys = {
  stats: (period: DashboardPeriod) => ['dashboard', 'stats', period] as const,
  charts: (period: DashboardPeriod) => ['dashboard', 'charts', period] as const,
  categories: (period: DashboardPeriod) => ['dashboard', 'categories', period] as const,
  recent: ['dashboard', 'recent'] as const,
};

export function useDashboardStats(period: DashboardPeriod) {
  return useQuery({
    queryKey: dashboardKeys.stats(period),
    queryFn: () => dashboardService.getStats(period),
  });
}

export function useDashboardCharts(period: DashboardPeriod) {
  return useQuery({
    queryKey: dashboardKeys.charts(period),
    queryFn: () => dashboardService.getChartData(period),
  });
}

export function useDashboardCategories(period: DashboardPeriod) {
  return useQuery({
    queryKey: dashboardKeys.categories(period),
    queryFn: () => dashboardService.getCategoryDistribution(period),
  });
}

export function useDashboardRecent() {
  return useQuery({
    queryKey: dashboardKeys.recent,
    queryFn: () => dashboardService.getRecentTransactions(6),
  });
}
