import { Container } from '@/shared/components/layout/Container';
import { DashboardCashFlowChart } from './charts/DashboardCashFlowChart';
import { DashboardCategoriesChart } from './charts/DashboardCategoriesChart';

export interface DashboardChartPoint {
    name: string;
    receita: number;
    despesa: number;
}

export interface DashboardCategoryPoint {
    name: string;
    value: number;
    fill?: string;
}

interface DashboardChartsProps {
    chartData: DashboardChartPoint[] | undefined;
    categories: DashboardCategoryPoint[] | undefined;
}

export function DashboardCharts({ chartData, categories }: DashboardChartsProps) {
    const safeChartData = chartData ?? [];
    const safeCategories = categories ?? [];

    return (
        <Container unstyled className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-12">
            <Container unstyled className="min-w-0 md:col-span-8">
                <DashboardCashFlowChart chartData={safeChartData} />
            </Container>

            <Container unstyled className="min-w-0 md:col-span-4">
                <DashboardCategoriesChart categories={safeCategories} />
            </Container>
        </Container>
    );
}


