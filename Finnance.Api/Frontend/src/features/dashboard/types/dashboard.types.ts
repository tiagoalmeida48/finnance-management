export interface DashboardStats {
  totalBalance: number;
  totalAvailableLimit: number;
  monthlyIncome: number;
  monthlyExpenses: number;
}

export interface DashboardChartRow {
  monthKey: string;
  income: number;
  expense: number;
}

export interface DashboardChartPoint {
  name: string;
  receita: number;
  despesa: number;
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
