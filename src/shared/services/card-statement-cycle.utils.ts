import { addMonths, format, isValid, parseISO, startOfMonth, subDays } from 'date-fns';
import type { CreditCardStatementCycle, CreditCardStatementPeriodRange, Transaction } from '../interfaces';

export const OPEN_CYCLE_END = '9999-12-31';

type StatementCycleLike = Pick<CreditCardStatementCycle, 'date_start' | 'date_end' | 'closing_day' | 'due_day'>;
type StatementCycleWithOptionalId = StatementCycleLike & { id?: string };
type StatementPeriodRangeLike =
    Pick<CreditCardStatementPeriodRange, 'period_start' | 'period_end'>
    & Partial<Pick<CreditCardStatementPeriodRange, 'statement_month_key'>>;

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
    statementPeriodRange?: StatementPeriodRangeLike | null;
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

const MONTH_KEY_PATTERN = /^[0-9]{4}-(0[1-9]|1[0-2])$/;

const resolveStatementMonthKeyFromRange = (range: StatementPeriodRangeLike) => {
    const explicitMonthKey = range.statement_month_key?.trim() || '';
    if (MONTH_KEY_PATTERN.test(explicitMonthKey)) {
        return explicitMonthKey;
    }

    const periodEndDate = toDateAtNoon(range.period_end);
    if (!periodEndDate) return null;
    return format(periodEndDate, 'yyyy-MM');
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
    toDateKeyIgnoringTime(transaction.payment_date)
    || toDateKeyIgnoringTime(transaction.purchase_date)
    || null;

export const sortStatementCyclesAsc = <T extends StatementCycleLike>(cycles: T[]) =>
    [...cycles].sort((a, b) => a.date_start.localeCompare(b.date_start));

export const resolveStatementCycleForDate = <T extends StatementCycleLike>(cycles: T[], dateKey: string) => {
    const orderedCycles = sortStatementCyclesAsc(cycles);
    return orderedCycles.find((cycle) => dateKey >= cycle.date_start && dateKey <= cycle.date_end) || null;
};

export const sortStatementPeriodRangesAsc = <T extends StatementPeriodRangeLike>(ranges: T[]) =>
    [...ranges].sort((a, b) => a.period_start.localeCompare(b.period_start));

export const resolveStatementPeriodRangeForDate = <T extends StatementPeriodRangeLike>(ranges: T[], dateKey: string) => {
    const orderedRanges = sortStatementPeriodRangesAsc(ranges);
    return orderedRanges.find((range) => dateKey >= range.period_start && dateKey <= range.period_end) || null;
};

export const getCurrentStatementCycle = <T extends StatementCycleLike>(
    cycles: T[],
    referenceDate: string = format(new Date(), 'yyyy-MM-dd')
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
    statementPeriodRanges: StatementPeriodRangeLike[] = []
): ResolvedStatementMonth | null => {
    const anchorDateKey = getTransactionAnchorDateKey(transaction);
    if (!anchorDateKey) return null;

    const anchorDate = toDateAtNoon(anchorDateKey);
    if (!anchorDate) return null;

    const cycle = resolveStatementCycleForDate(cycles, anchorDateKey) || fallbackCycle;
    if (!cycle) return null;

    const statementPeriodRange = resolveStatementPeriodRangeForDate(statementPeriodRanges, anchorDateKey);
    if (statementPeriodRange) {
        const statementMonthKey = resolveStatementMonthKeyFromRange(statementPeriodRange);
        if (!statementMonthKey) return null;

        const statementDate = toDateAtNoon(`${statementMonthKey}-01`);
        if (!statementDate) return null;

        return {
            anchorDate,
            anchorDateKey,
            statementDate,
            statementMonthKey,
            cycle,
            statementPeriodRange,
        };
    }

    // Determine which statement month this transaction belongs to.
    // closingMonthShift: if the anchor day is past the closing day, it starts a new cycle.
    // dueMonthShift: if closing_day >= due_day, the due date falls in the next month,
    // so the statement is named after the due month (one extra shift).
    const closingMonthShift = anchorDate.getDate() > cycle.closing_day ? 1 : 0;
    const dueMonthShift = cycle.closing_day >= cycle.due_day ? 1 : 0;
    const monthShift = closingMonthShift + dueMonthShift;

    const statementDate = addMonths(startOfMonth(anchorDate), monthShift);
    const fallbackStatementMonthKey = format(statementDate, 'yyyy-MM');

    // If a statement month already has an explicit configured range,
    // transactions outside that range must not be assigned to that month via fallback cycle rules.
    if (statementPeriodRanges.length > 0) {
        const configuredMonthKeys = new Set(
            statementPeriodRanges
                .map(resolveStatementMonthKeyFromRange)
                .filter((monthKey): monthKey is string => Boolean(monthKey))
        );

        if (configuredMonthKeys.has(fallbackStatementMonthKey)) {
            return null;
        }
    }

    return {
        anchorDate,
        anchorDateKey,
        statementDate,
        statementMonthKey: fallbackStatementMonthKey,
        cycle,
        statementPeriodRange: null,
    };
};

export const planCycleInsertion = (
    cycles: StatementCycleWithOptionalId[],
    dateStart: string
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

    const targetCycle = orderedCycles.find((cycle) => normalizedStart >= cycle.date_start && normalizedStart <= cycle.date_end);
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
