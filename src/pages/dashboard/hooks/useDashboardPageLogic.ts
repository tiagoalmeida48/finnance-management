import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { endOfYear, format, startOfYear } from 'date-fns';
import { dashboardService } from '@/shared/services/dashboard.service';
import { queryKeys } from '@/shared/constants/queryKeys';

export function useDashboardPageLogic() {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const filter = {
        start: format(startOfYear(new Date(selectedYear, 0, 1)), 'yyyy-MM-dd'),
        end: format(endOfYear(new Date(selectedYear, 0, 1)), 'yyyy-MM-dd'),
    };

    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: queryKeys.dashboard.stats(filter),
        queryFn: () => dashboardService.getStats(filter),
    });

    const { data: chartData, isLoading: chartLoading } = useQuery({
        queryKey: queryKeys.dashboard.charts(filter),
        queryFn: () => dashboardService.getChartData(filter),
    });

    const { data: categories, isLoading: categoriesLoading } = useQuery({
        queryKey: queryKeys.dashboard.categories(filter),
        queryFn: () => dashboardService.getCategoryDistribution(filter),
    });

    const isLoading = statsLoading || chartLoading || categoriesLoading;

    return {
        selectedYear, setSelectedYear,
        stats, chartData, categories,
        isLoading
    };
}
