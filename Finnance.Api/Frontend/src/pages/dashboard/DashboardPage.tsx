import { LayoutDashboard } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui';
import {
  DashboardCharts,
  DashboardFilters,
  DashboardRecentTransactions,
  DashboardSummary,
  useDashboardPageLogic,
} from '@/features/dashboard';

export function DashboardPage() {
  const {
    selectedYear,
    setSelectedYear,
    stats,
    chartData,
    categories,
    recentTransactions,
    isLoading,
  } = useDashboardPageLogic();

  return (
    <div className="space-y-6">
      <PageHeader
        icon={LayoutDashboard}
        eyebrow="Visão geral"
        title="Dashboard"
        description="Acompanhe seu saldo, receitas, despesas e movimentações recentes."
        actions={<DashboardFilters selectedYear={selectedYear} setSelectedYear={setSelectedYear} />}
      />

      <DashboardSummary stats={stats} chartData={chartData} isLoading={isLoading} />

      <DashboardCharts chartData={chartData} categories={categories} />

      <DashboardRecentTransactions transactions={recentTransactions} isLoading={isLoading} />
    </div>
  );
}
