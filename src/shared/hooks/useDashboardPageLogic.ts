import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard.service';
import { queryKeys } from '../constants/queryKeys';

export function useDashboardPageLogic() {
    const [filterType, setFilterType] = useState<'monthly' | 'general'>('general');
    const [currentDate, setCurrentDate] = useState(new Date());

    const filter = filterType === 'monthly' ? currentDate : undefined;

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

    const handlePrevMonth = () => {
        setCurrentDate(prev => {
            const d = new Date(prev);
            d.setMonth(d.getMonth() - 1);
            return d;
        });
    };

    const handleNextMonth = () => {
        setCurrentDate(prev => {
            const d = new Date(prev);
            d.setMonth(d.getMonth() + 1);
            return d;
        });
    };

    return {
        filterType, setFilterType,
        currentDate, setCurrentDate,
        stats, chartData, categories,
        isLoading,
        handlePrevMonth, handleNextMonth
    };
}
