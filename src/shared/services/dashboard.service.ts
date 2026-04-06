import { supabase } from '@/lib/supabase/client';
import { startOfMonth, endOfMonth, format, subMonths, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type DashboardFilter = Date | { start: string; end: string };

interface DashboardMonthBucket {
  key: string;
  name: string;
  receita: number;
  despesa: number;
  date: Date;
}

export const dashboardService = {
  async getStats(filter?: DashboardFilter) {
    let startDate: string | null = null;
    let endDate: string | null = null;

    if (filter instanceof Date) {
      startDate = format(startOfMonth(filter), 'yyyy-MM-dd');
      endDate = format(endOfMonth(filter), 'yyyy-MM-dd');
    } else if (filter && 'start' in filter && 'end' in filter) {
      startDate = filter.start;
      endDate = filter.end;
    }

    const { data, error } = await supabase.rpc('get_dashboard_stats', {
      p_start_date: startDate,
      p_end_date: endDate,
    });

    if (error) throw error;

    const stats = data as {
      total_balance: number;
      total_available_limit: number;
      monthly_income: number;
      monthly_expenses: number;
    };

    return {
      totalBalance: Number(stats.total_balance),
      totalLimit: Number(stats.total_available_limit),
      monthlyIncome: Number(stats.monthly_income),
      monthlyExpenses: Number(stats.monthly_expenses),
    };
  },

  async getChartData(filter?: DashboardFilter) {
    const months: DashboardMonthBucket[] = [];
    let startDate: string | null = null;
    let finalDate: string | null = null;

    if (filter instanceof Date) {
      const d = filter;
      months.push({
        key: format(d, 'yyyy-MM'),
        name: format(d, 'MMM/yy', { locale: ptBR }),
        receita: 0,
        despesa: 0,
        date: d,
      });
      startDate = format(startOfMonth(d), 'yyyy-MM-dd');
      finalDate = format(endOfMonth(d), 'yyyy-MM-dd');
    } else if (filter && 'start' in filter && 'end' in filter) {
      const start = new Date(filter.start + 'T12:00:00');
      const end = new Date(filter.end + 'T12:00:00');

      let current = new Date(start.getFullYear(), start.getMonth(), 1);
      const stop = new Date(end.getFullYear(), end.getMonth(), 1);

      while (current <= stop) {
        months.push({
          key: format(current, 'yyyy-MM'),
          name: format(current, 'MMM/yy', { locale: ptBR }),
          receita: 0,
          despesa: 0,
          date: new Date(current),
        });
        current = addMonths(current, 1);
      }
      startDate = format(startOfMonth(start), 'yyyy-MM-dd');
      finalDate = format(endOfMonth(end), 'yyyy-MM-dd');
    } else {
      const { data: firstTx } = await supabase
        .from('transactions')
        .select('payment_date')
        .order('payment_date', { ascending: true })
        .limit(1)
        .maybeSingle();

      const start = firstTx?.payment_date
        ? new Date(firstTx.payment_date + 'T12:00:00')
        : subMonths(new Date(), 11);
      const end = new Date();

      let current = new Date(start.getFullYear(), start.getMonth(), 1);
      const stop = new Date(end.getFullYear(), end.getMonth(), 1);

      while (current <= stop) {
        months.push({
          key: format(current, 'yyyy-MM'),
          name: format(current, 'MMM/yy', { locale: ptBR }),
          receita: 0,
          despesa: 0,
          date: new Date(current),
        });
        current = addMonths(current, 1);
      }
      startDate = format(startOfMonth(start), 'yyyy-MM-dd');
      finalDate = format(endOfMonth(end), 'yyyy-MM-dd');
    }

    if (months.length === 0) return [];

    const { data, error } = await supabase.rpc('get_chart_data', {
      p_start_date: startDate,
      p_end_date: finalDate,
    });

    if (error) throw error;

    const rpcRows = (data ?? []) as Array<{
      month_key: string;
      receita: number;
      despesa: number;
    }>;

    const rpcByKey = new Map(rpcRows.map((r) => [r.month_key, r]));

    return months.map(({ key, name }) => {
      const row = rpcByKey.get(key);
      return {
        name,
        receita: Number(row?.receita ?? 0),
        despesa: Number(row?.despesa ?? 0),
      };
    });
  },

  async getCategoryDistribution(filter?: DashboardFilter) {
    let startDate: string | null = null;
    let endDate: string | null = null;

    if (filter instanceof Date) {
      startDate = format(startOfMonth(filter), 'yyyy-MM-dd');
      endDate = format(endOfMonth(filter), 'yyyy-MM-dd');
    } else if (filter && 'start' in filter && 'end' in filter) {
      startDate = filter.start;
      endDate = filter.end;
    }

    const { data, error } = await supabase.rpc('get_category_distribution', {
      p_start_date: startDate,
      p_end_date: endDate,
    });

    if (error) throw error;

    return (data ?? []).map((row: { category_name: string; total: number }) => ({
      name: row.category_name,
      value: Number(row.total),
    }));
  },
};
