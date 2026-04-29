import { addMonths, format, isValid, parseISO, startOfMonth, subDays } from 'date-fns';
import type { CreditCardStatementCycle, Transaction } from '../interfaces';

export const OPEN_CYCLE_END = '9999-12-31';

type StatementCycleLike = Pick<
  CreditCardStatementCycle,
  'date_start' | 'date_end' | 'closing_day' | 'due_day'
>;
type StatementCycleWithOptionalId = StatementCycleLike & { id?: string };

interface StatementCycleFallback {
  closing_day: number;
  due_day: number;
}

interface TransactionDateLike {
  purchase_date?: string | null;
  payment_date?: string | null;
}

export interface ResolvedStatementMonth {
  anchorDate: Date;
  anchorDateKey: string;
  statementDate: Date;
  statementMonthKey: string;
  cycle: StatementCycleLike | StatementCycleFallback;
}

export interface CycleInsertionPlan {
  targetCycleId?: string;
  targetCycleStart: string;
  targetCycleEnd: string;
  previousCycleNewEnd: string;
  newCycleStart: string;
  newCycleEnd: string;
}

export const normalizeDateKey = (value: string) => {
  const parsed = parseISO(value);
  if (!isValid(parsed)) {
    throw new Error('Data invalida.');
  }
  return format(parsed, 'yyyy-MM-dd');
};

const toDateAtNoon = (value: string) => {
  const parsed = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

const toDateKeyIgnoringTime = (value?: string | null) => {
  if (!value) return null;

  const directDateMatch = value.match(/^(\d{4}-\d{2}-\d{2})/);
  if (directDateMatch) {
    return directDateMatch[1];
  }

  const parsed = parseISO(value);
  if (!isValid(parsed)) return null;
  return format(parsed, 'yyyy-MM-dd');
};

export const getTransactionAnchorDateKey = (transaction: TransactionDateLike) =>
  toDateKeyIgnoringTime(transaction.purchase_date) ||
  toDateKeyIgnoringTime(transaction.payment_date) ||
  null;

export const sortStatementCyclesAsc = <T extends StatementCycleLike>(cycles: T[]) =>
  [...cycles].sort((a, b) => a.date_start.localeCompare(b.date_start));

export const resolveStatementCycleForDate = <T extends StatementCycleLike>(
  cycles: T[],
  dateKey: string,
) => {
  const orderedCycles = sortStatementCyclesAsc(cycles);
  return (
    orderedCycles.find((cycle) => dateKey >= cycle.date_start && dateKey <= cycle.date_end) || null
  );
};

export const getCurrentStatementCycle = <T extends StatementCycleLike>(
  cycles: T[],
  referenceDate: string = format(new Date(), 'yyyy-MM-dd'),
) => {
  const byReference = resolveStatementCycleForDate(cycles, referenceDate);
  if (byReference) return byReference;

  const orderedCycles = sortStatementCyclesAsc(cycles);
  return orderedCycles.find((cycle) => cycle.date_end === OPEN_CYCLE_END) || null;
};

export const resolveStatementMonth = (
  transaction: Pick<Transaction, 'purchase_date' | 'payment_date'>,
  cycles: StatementCycleLike[],
  fallbackCycle?: StatementCycleFallback,
): ResolvedStatementMonth | null => {
  const anchorDateKey = getTransactionAnchorDateKey(transaction);
  if (!anchorDateKey) return null;

  const anchorDate = toDateAtNoon(anchorDateKey);
  if (!anchorDate) return null;

  const cycle = resolveStatementCycleForDate(cycles, anchorDateKey) || fallbackCycle;
  if (!cycle) return null;

  const effectiveClosingDay = cycle.closing_day;
  const effectiveDueDay = cycle.due_day;
  const closingMonthShift = anchorDate.getDate() > effectiveClosingDay ? 1 : 0;
  const dueMonthShift = effectiveClosingDay >= effectiveDueDay ? 1 : 0;
  const monthShift = closingMonthShift + dueMonthShift;

  const statementDate = addMonths(startOfMonth(anchorDate), monthShift);
  const statementMonthKey = format(statementDate, 'yyyy-MM');

  return {
    anchorDate,
    anchorDateKey,
    statementDate,
    statementMonthKey,
    cycle,
  };
};

export const planCycleInsertion = (
  cycles: StatementCycleWithOptionalId[],
  dateStart: string,
): CycleInsertionPlan => {
  const normalizedStart = normalizeDateKey(dateStart);
  const orderedCycles = sortStatementCyclesAsc(cycles);

  if (orderedCycles.length === 0) {
    throw new Error('Nao existe vigencia cadastrada para este cartao.');
  }

  const firstCycle = orderedCycles[0];
  if (normalizedStart < firstCycle.date_start) {
    throw new Error(`A data de inicio nao pode ser anterior a ${firstCycle.date_start}.`);
  }

  const targetCycle = orderedCycles.find(
    (cycle) => normalizedStart >= cycle.date_start && normalizedStart <= cycle.date_end,
  );
  if (!targetCycle) {
    throw new Error('Nao existe vigencia que contenha a data informada.');
  }

  if (normalizedStart <= targetCycle.date_start) {
    throw new Error(`A data de inicio deve ser maior que ${targetCycle.date_start}.`);
  }

  const normalizedStartDate = parseISO(normalizedStart);
  const previousCycleNewEnd = format(subDays(normalizedStartDate, 1), 'yyyy-MM-dd');
  if (previousCycleNewEnd < targetCycle.date_start) {
    throw new Error('Nao foi possivel dividir a vigencia atual com a data informada.');
  }

  return {
    targetCycleId: targetCycle.id,
    targetCycleStart: targetCycle.date_start,
    targetCycleEnd: targetCycle.date_end,
    previousCycleNewEnd,
    newCycleStart: normalizedStart,
    newCycleEnd: targetCycle.date_end,
  };
};
