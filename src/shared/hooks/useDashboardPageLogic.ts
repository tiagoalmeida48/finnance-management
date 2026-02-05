import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard.service';

export function useDashboardPageLogic() {
    const [filterType, setFilterType] = useState<'monthly' | 'general' | 'custom'>('general');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [customRange, setCustomRange] = useState<{ start: string; end: string }>({
        start: '',
        end: ''
    });

    const filter = filterType === 'monthly' ? currentDate :
        filterType === 'custom' && customRange.start && customRange.end ? customRange :
            undefined;

    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['dashboard-stats', filter],
        queryFn: () => dashboardService.getStats(filter),
    });

    const { data: chartData, isLoading: chartLoading } = useQuery({
        queryKey: ['dashboard-charts', filter],
        queryFn: () => dashboardService.getChartData(filter),
    });

    const { data: categories, isLoading: categoriesLoading } = useQuery({
        queryKey: ['dashboard-categories', filter],
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
        customRange, setCustomRange,
        stats, chartData, categories,
        isLoading,
        handlePrevMonth, handleNextMonth
    };
}
