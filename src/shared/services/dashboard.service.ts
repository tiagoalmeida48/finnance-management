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
    const [{ data: accounts }, { data: cards }, { data: usage }] = await Promise.all([
      supabase
        .from('bank_accounts')
        .select('current_balance, initial_balance')
        .is('deleted_at', null),
      supabase.from('credit_cards').select('credit_limit').is('deleted_at', null),
      supabase
        .from('transactions')
        .select('amount')
        .eq('is_paid', false)
        .not('card_id', 'is', null),
    ]);

    let startDate: string | null = null;
    let endDate: string | null = null;

    if (filter instanceof Date) {
      startDate = format(startOfMonth(filter), 'yyyy-MM-dd');
      endDate = format(endOfMonth(filter), 'yyyy-MM-dd');
    } else if (filter && 'start' in filter && 'end' in filter) {
      startDate = filter.start;
      endDate = filter.end;
    }

    let txQuery = supabase.from('transactions').select('amount, type, card_id');

    if (startDate) txQuery = txQuery.gte('payment_date', startDate);
    if (endDate) txQuery = txQuery.lte('payment_date', endDate);

    const { data: txData, error: txError } = await txQuery;
    if (txError) throw txError;

    const transactions = txData ?? [];

    const totalBalance =
      accounts?.reduce((acc, curr) => acc + (Number(curr.current_balance) || 0), 0) ?? 0;
    const totalLimit = cards?.reduce((acc, curr) => acc + (Number(curr.credit_limit) || 0), 0) ?? 0;
    const totalUsed = usage?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) ?? 0;

    const { data: firstTx } = await supabase
      .from('transactions')
      .select('payment_date')
      .order('payment_date', { ascending: true })
      .limit(1)
      .single();

    const firstDate = firstTx?.payment_date
      ? startOfMonth(new Date(firstTx.payment_date + 'T12:00:00'))
      : null;

    let shouldIncludeInitialBalance = false;
    if (!filter) {
      shouldIncludeInitialBalance = true;
    } else if (filter instanceof Date && firstDate) {
      shouldIncludeInitialBalance =
        format(startOfMonth(filter), 'yyyy-MM') === format(firstDate, 'yyyy-MM');
    } else if (filter && 'start' in filter && firstDate) {
      shouldIncludeInitialBalance = startOfMonth(new Date(filter.start)) <= firstDate;
    }

    const initialBalanceSum = accounts?.reduce((acc, a) => acc + (a.initial_balance || 0), 0) ?? 0;
    const baseIncome = shouldIncludeInitialBalance ? initialBalanceSum : 0;

    const monthlyIncome =
      transactions
        .filter((t) => t.type === 'income')
        .reduce((acc, t) => acc + (Number(t.amount) || 0), 0) + baseIncome;

    const monthlyExpenses = transactions
      .filter((t) => (t.type === 'expense' || t.type === 'transfer') && !t.card_id)
      .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

    return {
      totalBalance,
      totalLimit: totalLimit - totalUsed,
      monthlyIncome,
      monthlyExpenses,
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

    let query = supabase.from('transactions').select('amount, type, card_id, payment_date');

    if (startDate) query = query.gte('payment_date', startDate);
    if (finalDate) query = query.lte('payment_date', finalDate);

    const { data, error } = await query;
    if (error) throw error;

    for (const t of data ?? []) {
      const monthKey = format(new Date(t.payment_date + 'T12:00:00'), 'yyyy-MM');
      const month = months.find((m) => m.key === monthKey);
      if (!month) continue;

      if (t.type === 'income') {
        month.receita += Number(t.amount);
      } else if (t.type === 'transfer') {
        month.despesa += Number(t.amount);
      } else if (t.type === 'expense' && !t.card_id) {
        month.despesa += Number(t.amount);
      }
    }

    return months.map(({ name, receita, despesa }) => ({
      name,
      receita,
      despesa,
    }));
  },

  async getCategoryDistribution(filter?: DashboardFilter) {
    let query = supabase
      .from('transactions')
      .select('amount, category:category_id(name)')
      .eq('type', 'expense');

    if (filter instanceof Date) {
      query = query
        .gte('payment_date', format(startOfMonth(filter), 'yyyy-MM-dd'))
        .lte('payment_date', format(endOfMonth(filter), 'yyyy-MM-dd'));
    } else if (filter && 'start' in filter && 'end' in filter) {
      query = query.gte('payment_date', filter.start).lte('payment_date', filter.end);
    }

    const { data, error } = await query;
    if (error) throw error;

    const distribution: Record<string, number> = {};
    for (const t of data ?? []) {
      const category = Array.isArray(t.category) ? t.category[0] : t.category;
      const name = (category as { name?: string } | null)?.name ?? 'Geral';
      distribution[name] = (distribution[name] ?? 0) + Number(t.amount);
    }

    return Object.entries(distribution)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  },
};
