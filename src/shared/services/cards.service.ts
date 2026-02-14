import { format } from 'date-fns';
import { supabase } from '@/lib/supabase/client';
import {
    CreateCreditCardInput,
    CreateCreditCardStatementCycleInput,
    CreateCreditCardStatementPeriodRangeInput,
    CreditCard,
    CreditCardStatementCycle,
    CreditCardStatementPeriodRange,
    Transaction,
    UpdateCreditCardInput,
} from '../interfaces';
import type { CreditCardDetails } from '../interfaces/card-details.interface';
import {
    getCurrentStatementCycle,
    normalizeDateKey,
    planCycleInsertion,
    resolveStatementMonth,
    sortStatementPeriodRangesAsc,
    sortStatementCyclesAsc,
    OPEN_CYCLE_END,
} from './card-statement-cycle.utils';

type CardTransactionLite = Pick<Transaction, 'amount' | 'card_id' | 'payment_date' | 'purchase_date' | 'is_paid' | 'type'>;
const TRANSACTIONS_PAGE_SIZE = 1000;

const mapCyclesByCard = (cycles: CreditCardStatementCycle[]) =>
    cycles.reduce<Record<string, CreditCardStatementCycle[]>>((acc, cycle) => {
        if (!acc[cycle.card_id]) {
            acc[cycle.card_id] = [];
        }
        acc[cycle.card_id].push(cycle);
        return acc;
    }, {});

const mapStatementPeriodRangesByCard = (ranges: CreditCardStatementPeriodRange[]) =>
    ranges.reduce<Record<string, CreditCardStatementPeriodRange[]>>((acc, range) => {
        if (!acc[range.card_id]) {
            acc[range.card_id] = [];
        }
        acc[range.card_id].push(range);
        return acc;
    }, {});

const buildFallbackCycle = (
    card: Pick<CreditCard, 'closing_day' | 'due_day'>,
    currentCycle?: Pick<CreditCardStatementCycle, 'closing_day' | 'due_day'> | null
) => ({
    closing_day: Number(currentCycle?.closing_day ?? card.closing_day),
    due_day: Number(currentCycle?.due_day ?? card.due_day),
});

const sumTransactionAmount = (acc: number, transaction: Pick<Transaction, 'amount' | 'type'>) => {
    const amount = Number(transaction.amount) || 0;
    return transaction.type === 'income' ? acc - amount : acc + amount;
};

export const cardsService = {
    async getAll() {
        const { data: cards, error } = await supabase
            .from('credit_cards')
            .select('*, bank_account:bank_account_id(name)')
            .is('deleted_at', null)
            .order('name');

        if (error) {
            throw new Error(error.message || 'Nao foi possivel criar o range de periodo da fatura.');
        }

        let from = 0;
        const allCardTransactions: CardTransactionLite[] = [];

        while (true) {
            const { data, error: transError } = await supabase
                .from('transactions')
                .select('amount, card_id, payment_date, purchase_date, is_paid, type')
                .not('card_id', 'is', null)
                .order('payment_date', { ascending: false })
                .range(from, from + TRANSACTIONS_PAGE_SIZE - 1);

            if (transError) throw transError;

            const page = (data ?? []) as CardTransactionLite[];
            allCardTransactions.push(...page);

            if (page.length < TRANSACTIONS_PAGE_SIZE) break;
            from += TRANSACTIONS_PAGE_SIZE;
        }

        const { data: cycles, error: cyclesError } = await supabase
            .from('credit_card_statement_cycles')
            .select('*')
            .order('date_start', { ascending: true });

        if (cyclesError) throw cyclesError;

        const { data: statementPeriodRanges, error: statementPeriodRangesError } = await supabase
            .from('credit_card_statement_period_ranges')
            .select('*')
            .order('period_start', { ascending: true });

        if (statementPeriodRangesError) throw statementPeriodRangesError;

        const now = new Date();
        const currentMonthKey = format(now, 'yyyy-MM');

        const cardRows = (cards ?? []) as CreditCard[];
        const allCycles = (cycles ?? []) as CreditCardStatementCycle[];
        const allStatementPeriodRanges = (statementPeriodRanges ?? []) as CreditCardStatementPeriodRange[];
        const cyclesByCard = mapCyclesByCard(allCycles);
        const statementPeriodRangesByCard = mapStatementPeriodRangesByCard(allStatementPeriodRanges);

        return cardRows.map((card) => {
            const cardTransactions = allCardTransactions.filter((transaction) => transaction.card_id === card.id);
            const cardCycles = sortStatementCyclesAsc(cyclesByCard[card.id] ?? []);
            const cardStatementPeriodRanges = sortStatementPeriodRangesAsc(statementPeriodRangesByCard[card.id] ?? []);
            const currentCycle = getCurrentStatementCycle(cardCycles);
            const fallbackCycle = buildFallbackCycle(card, currentCycle);

            const totalUsage = cardTransactions
                .filter((transaction) => !transaction.is_paid)
                .reduce(sumTransactionAmount, 0);

            const currentInvoice = cardTransactions
                .filter((transaction) => !transaction.is_paid)
                .reduce((acc, transaction) => {
                    const resolved = resolveStatementMonth(transaction, cardCycles, fallbackCycle, cardStatementPeriodRanges);
                    if (!resolved || resolved.statementMonthKey !== currentMonthKey) {
                        return acc;
                    }
                    return sumTransactionAmount(acc, transaction);
                }, 0);

            return {
                ...card,
                statement_cycles: cardCycles,
                statement_period_ranges: cardStatementPeriodRanges,
                current_statement_cycle: currentCycle,
                usage: totalUsage,
                current_invoice: currentInvoice,
                available_limit: Number(card.credit_limit) - totalUsage,
            };
        });
    },

    async create(card: CreateCreditCardInput) {
        const { data: authData } = await supabase.auth.getUser();
        const user = authData.user;
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('credit_cards')
            .insert({ ...card, user_id: user.id })
            .select()
            .single();

        if (error) throw error;

        const createdCard = data as CreditCard;
        const dateStart = format(new Date(), 'yyyy-MM-dd');

        const { data: cycleData, error: cycleError } = await supabase
            .from('credit_card_statement_cycles')
            .insert({
                user_id: user.id,
                card_id: createdCard.id,
                date_start: dateStart,
                date_end: OPEN_CYCLE_END,
                closing_day: card.closing_day,
                due_day: card.due_day,
                notes: 'Vigencia inicial criada no cadastro do cartao.',
            })
            .select('*')
            .single();

        if (cycleError) {
            await supabase.from('credit_cards').delete().eq('id', createdCard.id);
            throw cycleError;
        }

        const createdCycle = cycleData as CreditCardStatementCycle;
        return {
            ...createdCard,
            statement_cycles: [createdCycle],
            current_statement_cycle: createdCycle,
        } as CreditCard;
    },

    async update(id: string, updates: UpdateCreditCardInput) {
        const payload = { ...updates } as Record<string, unknown>;
        if ('closing_day' in payload || 'due_day' in payload) {
            throw new Error('Alteracoes de vencimento e fechamento devem ser feitas pelo historico de ciclo da fatura.');
        }

        const { data, error } = await supabase
            .from('credit_cards')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as CreditCard;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('credit_cards')
            .update({ deleted_at: new Date().toISOString(), is_active: false })
            .eq('id', id);

        if (error) throw error;
    },

    async getStatementCycles(cardId: string) {
        const { data, error } = await supabase
            .from('credit_card_statement_cycles')
            .select('*')
            .eq('card_id', cardId)
            .order('date_start', { ascending: false });

        if (error) throw error;
        return (data ?? []) as CreditCardStatementCycle[];
    },

    async getStatementPeriodRanges(cardId: string) {
        const { data, error } = await supabase
            .from('credit_card_statement_period_ranges')
            .select('*')
            .eq('card_id', cardId)
            .order('period_start', { ascending: false });

        if (error) throw error;
        return (data ?? []) as CreditCardStatementPeriodRange[];
    },

    async createStatementCycle(input: CreateCreditCardStatementCycleInput) {
        const normalizedStartDate = normalizeDateKey(input.date_start);

        const { data: existingCycles, error: cyclesError } = await supabase
            .from('credit_card_statement_cycles')
            .select('*')
            .eq('card_id', input.card_id)
            .order('date_start', { ascending: true });

        if (cyclesError) throw cyclesError;

        const cycleRows = (existingCycles ?? []) as CreditCardStatementCycle[];
        if (cycleRows.length === 0) {
            const { data: authData } = await supabase.auth.getUser();
            const user = authData.user;
            if (!user) throw new Error('Not authenticated');

            const { data: seededCycle, error: seedError } = await supabase
                .from('credit_card_statement_cycles')
                .insert({
                    user_id: user.id,
                    card_id: input.card_id,
                    date_start: normalizedStartDate,
                    date_end: OPEN_CYCLE_END,
                    closing_day: input.closing_day,
                    due_day: input.due_day,
                    notes: input.notes?.trim() ? input.notes.trim() : 'Vigencia inicial criada manualmente.',
                })
                .select('*')
                .single();

            if (seedError) throw seedError;
            return seededCycle as CreditCardStatementCycle;
        }

        planCycleInsertion(cycleRows, normalizedStartDate);

        const { data, error } = await supabase.rpc('create_credit_card_statement_cycle', {
            p_card_id: input.card_id,
            p_date_start: normalizedStartDate,
            p_closing_day: input.closing_day,
            p_due_day: input.due_day,
            p_notes: input.notes?.trim() ? input.notes.trim() : null,
        });

        if (error) throw error;

        const inserted = Array.isArray(data) ? data[0] : data;
        if (!inserted) {
            throw new Error('Nao foi possivel criar a nova vigencia.');
        }

        return inserted as CreditCardStatementCycle;
    },

    async createStatementPeriodRange(input: CreateCreditCardStatementPeriodRangeInput) {
        const normalizedPeriodStart = normalizeDateKey(input.period_start);
        const normalizedPeriodEnd = normalizeDateKey(input.period_end);
        const normalizedStatementMonthKey = input.statement_month_key?.trim();
        const normalizedStatementName = input.statement_name?.trim();

        if (normalizedPeriodStart > normalizedPeriodEnd) {
            throw new Error('Periodo invalido: abertura nao pode ser maior que fechamento.');
        }

        if (!normalizedStatementMonthKey) {
            throw new Error('Chave da fatura obrigatoria.');
        }

        if (!normalizedStatementName) {
            throw new Error('Nome da fatura obrigatorio.');
        }

        const { data, error } = await supabase.rpc('create_credit_card_statement_period_range', {
            p_card_id: input.card_id,
            p_period_start: normalizedPeriodStart,
            p_period_end: normalizedPeriodEnd,
            p_statement_month_key: normalizedStatementMonthKey,
            p_statement_name: normalizedStatementName,
            p_notes: input.notes?.trim() ? input.notes.trim() : null,
        });

        if (error) {
            throw new Error(error.message || 'Nao foi possivel criar o range de periodo da fatura.');
        }

        const inserted = Array.isArray(data) ? data[0] : data;
        if (!inserted) {
            throw new Error('Nao foi possivel criar o range de periodo da fatura.');
        }

        return inserted as CreditCardStatementPeriodRange;
    },

    async deleteStatementPeriodRange(id: string) {
        const { error } = await supabase
            .from('credit_card_statement_period_ranges')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async getCardDetails(id: string) {
        const { data: card, error: cardError } = await supabase
            .from('credit_cards')
            .select('*, bank_account:bank_account_id(name)')
            .eq('id', id)
            .single();

        if (cardError) throw cardError;

        let from = 0;
        const cardTransactions: Transaction[] = [];

        while (true) {
            const { data, error: transError } = await supabase
                .from('transactions')
                .select('*, category:category_id(name, color, icon)')
                .eq('card_id', id)
                .order('payment_date', { ascending: false })
                .range(from, from + TRANSACTIONS_PAGE_SIZE - 1);

            if (transError) throw transError;

            const page = (data ?? []) as Transaction[];
            cardTransactions.push(...page);

            if (page.length < TRANSACTIONS_PAGE_SIZE) break;
            from += TRANSACTIONS_PAGE_SIZE;
        }

        const { data: cycles, error: cyclesError } = await supabase
            .from('credit_card_statement_cycles')
            .select('*')
            .eq('card_id', id)
            .order('date_start', { ascending: true });

        if (cyclesError) throw cyclesError;

        const { data: statementPeriodRanges, error: statementPeriodRangesError } = await supabase
            .from('credit_card_statement_period_ranges')
            .select('*')
            .eq('card_id', id)
            .order('period_start', { ascending: true });

        if (statementPeriodRangesError) throw statementPeriodRangesError;

        const now = new Date();
        const currentMonthKey = format(now, 'yyyy-MM');

        const cardRow = card as CreditCard;
        const cardCycles = sortStatementCyclesAsc((cycles ?? []) as CreditCardStatementCycle[]);
        const cardStatementPeriodRanges = sortStatementPeriodRangesAsc((statementPeriodRanges ?? []) as CreditCardStatementPeriodRange[]);
        const currentCycle = getCurrentStatementCycle(cardCycles);
        const fallbackCycle = buildFallbackCycle(cardRow, currentCycle);

        const totalUsage = cardTransactions
            .filter((transaction) => !transaction.is_paid)
            .reduce(sumTransactionAmount, 0);

        const currentInvoice = cardTransactions
            .filter((transaction) => !transaction.is_paid)
            .reduce((acc, transaction) => {
                const resolved = resolveStatementMonth(transaction, cardCycles, fallbackCycle, cardStatementPeriodRanges);
                if (!resolved || resolved.statementMonthKey !== currentMonthKey) {
                    return acc;
                }
                return sumTransactionAmount(acc, transaction);
            }, 0);

        return {
            ...cardRow,
            transactions: cardTransactions,
            statement_cycles: cardCycles,
            statement_period_ranges: cardStatementPeriodRanges,
            current_statement_cycle: currentCycle,
            usage: totalUsage,
            current_invoice: currentInvoice,
            available_limit: Number(cardRow.credit_limit) - totalUsage,
        } as CreditCardDetails;
    },
};
