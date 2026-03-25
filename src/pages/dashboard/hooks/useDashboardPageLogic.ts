import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { endOfYear, format, startOfYear } from "date-fns";
import { transactionsService } from "@/shared/services/transactions.service";
import { queryKeys } from "@/shared/constants/queryKeys";
import {
  useDashboardStats,
  useDashboardCharts,
  useDashboardCategories,
} from "@/shared/hooks/api/useDashboard";

export function useDashboardPageLogic() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const filter = {
    start: format(startOfYear(new Date(selectedYear, 0, 1)), "yyyy-MM-dd"),
    end: format(endOfYear(new Date(selectedYear, 0, 1)), "yyyy-MM-dd"),
  };

  const { data: stats, isLoading: statsLoading } = useDashboardStats(filter);
  const { data: chartData, isLoading: chartLoading } = useDashboardCharts(filter);
  const { data: categories, isLoading: categoriesLoading } = useDashboardCategories(filter);

  const { data: recentTransactions, isLoading: recentLoading } = useQuery({
    queryKey: queryKeys.transactions.recent,
    queryFn: () => transactionsService.getRecent(6),
  });

  const isLoading = statsLoading || chartLoading || categoriesLoading || recentLoading;

  return {
    selectedYear,
    setSelectedYear,
    stats,
    chartData,
    categories,
    recentTransactions,
    isLoading,
  };
}
