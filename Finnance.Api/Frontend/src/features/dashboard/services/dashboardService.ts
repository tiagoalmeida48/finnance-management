import { apiClient } from '@/config/http';
import type {
  DashboardCategoryRow,
  DashboardChartRow,
  DashboardPeriod,
  DashboardStats,
} from '../types/dashboard.types';
import type { RecentTransaction } from '../types/recentTransaction.types';

export const dashboardService = {
  getStats: async (period: DashboardPeriod): Promise<DashboardStats> => {
    return apiClient.get<DashboardStats>('/dashboard/stats', {
      startDate: period.startDate,
      endDate: period.endDate,
    });
  },

  getChartData: async (period: DashboardPeriod): Promise<DashboardChartRow[]> => {
    return apiClient.get<DashboardChartRow[]>('/dashboard/chart-data', {
      card: 0,
      startDate: period.startDate,
      endDate: period.endDate,
    });
  },

  getCategoryDistribution: async (period: DashboardPeriod): Promise<DashboardCategoryRow[]> => {
    return apiClient.get<DashboardCategoryRow[]>('/dashboard/category-distribution', {
      startDate: period.startDate,
      endDate: period.endDate,
    });
  },

  getRecentTransactions: async (quantity = 6): Promise<RecentTransaction[]> => {
    return apiClient.get<RecentTransaction[]>('/transaction/recent', { quantity });
  },
};
