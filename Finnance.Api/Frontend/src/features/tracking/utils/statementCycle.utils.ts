import { addMonths, format, isValid, parseISO, startOfMonth } from 'date-fns';
import type {
  StatementCycleFallback,
  StatementCycleLike,
} from '../types/tracking.types';

interface TransactionDateLike {
  purchaseDate: string | null;
  paymentDate: string | null;
}

interface ResolvedStatementMonth {
  statementMonthKey: string;
}

function toDateKeyIgnoringTime(value: string | null): string | null {
  if (!value) return null;

  const directMatch = value.match(/^(\d{4}-\d{2}-\d{2})/);
  if (directMatch) return directMatch[1];

  const parsed = parseISO(value);
  if (!isValid(parsed)) return null;
  return format(parsed, 'yyyy-MM-dd');
}

function toDateAtNoon(value: string): Date | null {
  const parsed = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

export function getTransactionAnchorDateKey(transaction: TransactionDateLike): string | null {
  return (
    toDateKeyIgnoringTime(transaction.purchaseDate) ||
    toDateKeyIgnoringTime(transaction.paymentDate) ||
    null
  );
}

function sortCyclesAsc(cycles: StatementCycleLike[]): StatementCycleLike[] {
  return [...cycles].sort((a, b) => a.dateStart.localeCompare(b.dateStart));
}

function resolveCycleForDate(
  cycles: StatementCycleLike[],
  dateKey: string,
): StatementCycleLike | null {
  const ordered = sortCyclesAsc(cycles);
  return (
    ordered.find((cycle) => dateKey >= cycle.dateStart && dateKey <= cycle.dateEnd) || null
  );
}

export function resolveStatementMonth(
  transaction: TransactionDateLike,
  cycles: StatementCycleLike[],
  fallbackCycle?: StatementCycleFallback,
): ResolvedStatementMonth | null {
  const anchorDateKey = getTransactionAnchorDateKey(transaction);
  if (!anchorDateKey) return null;

  const anchorDate = toDateAtNoon(anchorDateKey);
  if (!anchorDate) return null;

  const cycle = resolveCycleForDate(cycles, anchorDateKey) || fallbackCycle;
  if (!cycle) return null;

  const closingDay = cycle.closingDay;
  const dueDay = cycle.dueDay;
  const closingMonthShift = anchorDate.getDate() > closingDay ? 1 : 0;
  const dueMonthShift = closingDay >= dueDay ? 1 : 0;
  const monthShift = closingMonthShift + dueMonthShift;

  const statementDate = addMonths(startOfMonth(anchorDate), monthShift);
  const statementMonthKey = format(statementDate, 'yyyy-MM');

  return { statementMonthKey };
}
