export interface DashboardStats {
  totalBalance: number;
  totalAvailableLimit: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  netFlowDelta: number;
  hasNetHistory: boolean;
  avgMonthlyIncome: number;
  avgMonthlyExpenses: number;
}

export interface DashboardChartRow {
  monthKey: string;
  income: number;
  expense: number;
  cumulativeNet: number | null;
}

export interface DashboardChartPoint {
  name: string;
  receita: number;
  despesa: number;
  cumulativeNet: number | null;
}

export interface DashboardCategoryRow {
  categoryName: string;
  total: number;
}

export interface DashboardCategoryPoint {
  name: string;
  value: number;
  fill?: string;
}

export interface DashboardPeriod {
  startDate: string;
  endDate: string;
}
