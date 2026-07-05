import { useMemo, useState } from 'react';
import { endOfYear, format, startOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  useDashboardCategories,
  useDashboardCharts,
  useDashboardRecent,
  useDashboardStats,
} from './useDashboard';
import { CATEGORY_PALETTE } from '../constants';
import type {
  DashboardCategoryPoint,
  DashboardChartPoint,
  DashboardPeriod,
} from '../types/dashboard.types';

function buildMonths(year: number) {
  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date(year, index, 1);
    return {
      key: format(date, 'yyyy-MM'),
      name: format(date, 'MMM/yy', { locale: ptBR }),
    };
  });
}

export function useDashboardPageLogic() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const period = useMemo<DashboardPeriod>(() => {
    const reference = new Date(selectedYear, 0, 1);
    return {
      startDate: format(startOfYear(reference), 'yyyy-MM-dd'),
      endDate: format(endOfYear(reference), 'yyyy-MM-dd'),
    };
  }, [selectedYear]);

  const statsQuery = useDashboardStats(period);
  const chartsQuery = useDashboardCharts(period);
  const categoriesQuery = useDashboardCategories(period);
  const recentQuery = useDashboardRecent();

  const chartData = useMemo<DashboardChartPoint[]>(() => {
    const rows = chartsQuery.data ?? [];
    const byKey = new Map(rows.map((row) => [row.monthKey, row]));
    return buildMonths(selectedYear).map(({ key, name }) => {
      const row = byKey.get(key);
      return {
        name,
        receita: Number(row?.income ?? 0),
        despesa: Number(row?.expense ?? 0),
        cumulativeNet: row?.cumulativeNet ?? null,
      };
    });
  }, [chartsQuery.data, selectedYear]);

  const categories = useMemo<DashboardCategoryPoint[]>(() => {
    const rows = categoriesQuery.data ?? [];
    return rows.map((row, index) => ({
      name: row.categoryName,
      value: Number(row.total),
      fill: CATEGORY_PALETTE[index % CATEGORY_PALETTE.length],
    }));
  }, [categoriesQuery.data]);

  const isLoading =
    statsQuery.isLoading ||
    chartsQuery.isLoading ||
    categoriesQuery.isLoading ||
    recentQuery.isLoading;

  return {
    selectedYear,
    setSelectedYear,
    stats: statsQuery.data,
    chartData,
    categories,
    recentTransactions: recentQuery.data,
    isLoading,
  };
}
