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
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-text">Dashboard</h1>
          <p className="text-sm text-text-muted">
            Acompanhe seu saldo, receitas, despesas e movimentações recentes.
          </p>
        </div>
        <DashboardFilters selectedYear={selectedYear} setSelectedYear={setSelectedYear} />
      </div>

      <DashboardSummary stats={stats} isLoading={isLoading} />

      <DashboardCharts chartData={chartData} categories={categories} />

      <DashboardRecentTransactions transactions={recentTransactions} isLoading={isLoading} />
    </div>
  );
}
