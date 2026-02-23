import { supabase } from "@/lib/supabase/client";
import {
  startOfMonth,
  endOfMonth,
  format,
  subMonths,
  addMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Transaction } from "../interfaces/transaction.interface";

type DashboardFilter = Date | { start: string; end: string };

interface DashboardTransactionRow {
  amount: number;
  type: string;
  card_id?: string | null;
  payment_date: string;
  category?: { name?: string } | null;
}

interface DashboardMonthBucket {
  key: string;
  name: string;
  receita: number;
  despesa: number;
  date: Date;
}

interface CategoryDistributionRow {
  amount: number;
  category?: { name?: string } | { name?: string }[] | null;
}

export const dashboardService = {
  async getStats(filter?: DashboardFilter) {
    const { data: accounts } = await supabase
      .from("bank_accounts")
      .select("current_balance, initial_balance")
      .is("deleted_at", null);
    const { data: cards } = await supabase
      .from("credit_cards")
      .select("credit_limit")
      .is("deleted_at", null);

    const { data: usage } = await supabase
      .from("transactions")
      .select("amount")
      .is("is_paid", false)
      .not("card_id", "is", null);

    let query = supabase.from("transactions").select("*");

    if (filter instanceof Date) {
      const start = startOfMonth(filter).toISOString();
      const end = endOfMonth(filter).toISOString();
      query = query.gte("payment_date", start).lte("payment_date", end);
    } else if (filter && "start" in filter && "end" in filter) {
      query = query
        .gte("payment_date", filter.start)
        .lte("payment_date", filter.end);
    }

    const { data: transactionsData } = await query;
    const transactions = (transactionsData ?? []) as Transaction[];

    const totalBalance =
      accounts?.reduce(
        (acc, curr) => acc + (Number(curr.current_balance) || 0),
        0,
      ) || 0;
    const totalLimit =
      cards?.reduce((acc, curr) => acc + (Number(curr.credit_limit) || 0), 0) ||
      0;
    const totalUsed =
      usage?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0;

    const { data: firstTx } = await supabase
      .from("transactions")
      .select("payment_date")
      .order("payment_date", { ascending: true })
      .limit(1)
      .single();

    const firstDate = firstTx?.payment_date
      ? startOfMonth(new Date(firstTx.payment_date + "T12:00:00"))
      : null;
    let shouldIncludeInitialBalance = false;

    if (!filter) {
      shouldIncludeInitialBalance = true;
    } else if (filter instanceof Date && firstDate) {
      shouldIncludeInitialBalance =
        format(startOfMonth(filter), "yyyy-MM") ===
        format(firstDate, "yyyy-MM");
    } else if (filter && "start" in filter && firstDate) {
      const startRange = startOfMonth(new Date(filter.start));
      shouldIncludeInitialBalance = startRange <= firstDate;
    }

    const initialBalanceSum =
      accounts?.reduce((acc, a) => acc + (a.initial_balance || 0), 0) || 0;
    const baseIncome = shouldIncludeInitialBalance ? initialBalanceSum : 0;

    const monthlyIncome =
      (transactions
        .filter((t) => t.type === "income")
        .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0) +
      baseIncome;

    const monthlyExpenses =
      transactions
        .filter(
          (t) => (t.type === "expense" || t.type === "transfer") && !t.card_id,
        )
        .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0;

    return {
      totalBalance,
      totalLimit: totalLimit - totalUsed,
      monthlyIncome,
      monthlyExpenses,
      transactions,
    };
  },

  async getChartData(filter?: DashboardFilter) {
    const months: DashboardMonthBucket[] = [];
    let startDate: string | null = null;
    let finalDate: string | null = null;

    if (filter instanceof Date) {
      const d = filter;
      months.push({
        key: format(d, "yyyy-MM"),
        name: format(d, "MMM/yy", { locale: ptBR }),
        receita: 0,
        despesa: 0,
        date: d,
      });
      startDate = startOfMonth(d).toISOString();
      finalDate = endOfMonth(d).toISOString();
    } else if (filter && "start" in filter && "end" in filter) {
      const start = new Date(filter.start + "T12:00:00");
      const end = new Date(filter.end + "T12:00:00");

      let current = new Date(start.getFullYear(), start.getMonth(), 1);
      const stop = new Date(end.getFullYear(), end.getMonth(), 1);

      while (current <= stop) {
        months.push({
          key: format(current, "yyyy-MM"),
          name: format(current, "MMM/yy", { locale: ptBR }),
          receita: 0,
          despesa: 0,
          date: new Date(current),
        });
        current = addMonths(current, 1);
      }
      startDate = startOfMonth(start).toISOString();
      finalDate = endOfMonth(end).toISOString();
    } else {
      const { data: firstTx } = await supabase
        .from("transactions")
        .select("payment_date")
        .order("payment_date", { ascending: true })
        .limit(1)
        .maybeSingle();

      const start = firstTx?.payment_date
        ? new Date(firstTx.payment_date + "T12:00:00")
        : subMonths(new Date(), 11);
      const end = new Date();

      let current = new Date(start.getFullYear(), start.getMonth(), 1);
      const stop = new Date(end.getFullYear(), end.getMonth(), 1);

      while (current <= stop) {
        months.push({
          key: format(current, "yyyy-MM"),
          name: format(current, "MMM/yy", { locale: ptBR }),
          receita: 0,
          despesa: 0,
          date: new Date(current),
        });
        current = addMonths(current, 1);
      }
      startDate = startOfMonth(start).toISOString();
      finalDate = endOfMonth(end).toISOString();
    }

    if (months.length === 0) return [];

    let query = supabase.from("transactions").select("*");
    if (startDate)
      query = query.gte(
        "payment_date",
        format(new Date(startDate), "yyyy-MM-dd"),
      );
    if (finalDate)
      query = query.lte(
        "payment_date",
        format(new Date(finalDate), "yyyy-MM-dd"),
      );

    const { data: transactionsData } = await query;
    const transactions = (transactionsData ?? []) as DashboardTransactionRow[];

    transactions.forEach((t) => {
      const date = new Date(t.payment_date + "T12:00:00");
      const monthKey = format(date, "yyyy-MM");
      const month = months.find((m) => m.key === monthKey);

      if (month) {
        if (t.type === "income" || t.type === "receita") {
          month.receita += Number(t.amount);
        } else if (t.type === "transfer") {
          month.despesa += Number(t.amount);
        } else if (
          (t.type === "expense" || t.type === "despesa") &&
          !t.card_id
        ) {
          month.despesa += Number(t.amount);
        }
      }
    });

    return months.map(({ name, receita, despesa }) => ({
      name,
      receita,
      despesa,
    }));
  },

  async getCategoryDistribution(filter?: DashboardFilter) {
    let query = supabase
      .from("transactions")
      .select("amount, category:category_id(name)")
      .eq("type", "expense");

    if (filter instanceof Date) {
      const start = startOfMonth(filter).toISOString();
      const end = endOfMonth(filter).toISOString();
      query = query.gte("payment_date", start).lte("payment_date", end);
    } else if (filter && "start" in filter && "end" in filter) {
      query = query
        .gte("payment_date", filter.start)
        .lte("payment_date", filter.end);
    }

    const { data: transactionsData } = await query;
    const transactions = (transactionsData ?? []) as CategoryDistributionRow[];
    const distribution: Record<string, number> = {};

    transactions.forEach((t) => {
      const category = Array.isArray(t.category) ? t.category[0] : t.category;
      const name = category?.name || "Geral";
      distribution[name] = (distribution[name] || 0) + Number(t.amount);
    });

    return Object.entries(distribution)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  },
};
