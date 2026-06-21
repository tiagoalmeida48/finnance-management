import { DashboardCashFlowChart } from './charts/DashboardCashFlowChart';
import { DashboardCategoriesChart } from './charts/DashboardCategoriesChart';
import type { DashboardCategoryPoint, DashboardChartPoint } from '../types/dashboard.types';

interface DashboardChartsProps {
  chartData: DashboardChartPoint[] | undefined;
  categories: DashboardCategoryPoint[] | undefined;
}

export function DashboardCharts({ chartData, categories }: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <div className="min-w-0 lg:col-span-8">
        <DashboardCashFlowChart chartData={chartData ?? []} />
      </div>
      <div className="min-w-0 lg:col-span-4">
        <DashboardCategoriesChart categories={categories ?? []} />
      </div>
    </div>
  );
}
