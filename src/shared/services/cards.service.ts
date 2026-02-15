import { format } from 'date-fns';
import { supabase } from '@/lib/supabase/client';
import {
    CreateCreditCardInput,
    CreateCreditCardStatementCycleInput,
    CreditCard,
    CreditCardInvoice,
    CreditCardStatementCycle,
    Transaction,
    UpdateCreditCardInput,
} from '../interfaces';
import type { CreditCardDetails } from '../interfaces/card-details.interface';
import {
    getCurrentStatementCycle,
    normalizeDateKey,
    planCycleInsertion,
    sortStatementCyclesAsc,
    OPEN_CYCLE_END,
} from './card-statement-cycle.utils';

const TRANSACTIONS_PAGE_SIZE = 1000;

const mapCyclesByCard = (cycles: CreditCardStatementCycle[]) =>
    cycles.reduce<Record<string, CreditCardStatementCycle[]>>((acc, cycle) => {
        if (!acc[cycle.card_id]) acc[cycle.card_id] = [];
        acc[cycle.card_id].push(cycle);
        return acc;
    }, {});

const mapByCard = <T extends { card_id: string }>(items: T[]) =>
    items.reduce<Record<string, T[]>>((acc, item) => {
        if (!acc[item.card_id]) acc[item.card_id] = [];
        acc[item.card_id].push(item);
        return acc;
    }, {});

export const cardsService = {
    async getAll() {
        const { data: cards, error } = await supabase
            .from('credit_cards')
            .select('*, bank_account:bank_account_id(name)')
            .is('deleted_at', null)
            .order('name');

        if (error) throw new Error(error.message);

        const { data: invoices, error: invError } = await supabase
            .from('credit_card_invoices')
            .select('*')
            .order('month_key', { ascending: false });

        if (invError) throw invError;

        const { data: cycles, error: cyclesError } = await supabase
            .from('credit_card_statement_cycles')
            .select('*')
            .order('date_start', { ascending: true });

        if (cyclesError) throw cyclesError;

        const now = new Date();
        const currentMonthKey = format(now, 'yyyy-MM');

        const cardRows = (cards ?? []) as CreditCard[];
        const allInvoices = (invoices ?? []) as CreditCardInvoice[];
        const allCycles = (cycles ?? []) as CreditCardStatementCycle[];

        const invoicesByCard = mapByCard(allInvoices);
        const cyclesByCard = mapCyclesByCard(allCycles);

        return cardRows.map((card) => {
            const cardCycles = sortStatementCyclesAsc(cyclesByCard[card.id] ?? []);
            const cardInvoices = invoicesByCard[card.id] ?? [];
            const currentCycle = getCurrentStatementCycle(cardCycles);

            const unpaidInvoices = cardInvoices.filter(inv => inv.status !== 'paid');
            const totalUsage = unpaidInvoices.reduce((acc, inv) => acc + (Number(inv.total_amount) - Number(inv.paid_amount)), 0);

            const currentInvoiceData = cardInvoices.find(inv => inv.month_key === currentMonthKey);
            const currentInvoice = currentInvoiceData
                ? Number(currentInvoiceData.total_amount) - Number(currentInvoiceData.paid_amount)
                : 0;

            return {
                ...card,
                statement_cycles: cardCycles,
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

        const { data: invoices, error: invError } = await supabase
            .from('credit_card_invoices')
            .select('*')
            .eq('card_id', id)
            .order('month_key', { ascending: false });

        if (invError) throw invError;

        const { data: cycles, error: cyclesError } = await supabase
            .from('credit_card_statement_cycles')
            .select('*')
            .eq('card_id', id)
            .order('date_start', { ascending: true });

        if (cyclesError) throw cyclesError;

        const cardRow = card as CreditCard;
        const cardCycles = sortStatementCyclesAsc((cycles ?? []) as CreditCardStatementCycle[]);
        const cardInvoices = (invoices ?? []) as CreditCardInvoice[];
        const currentCycle = getCurrentStatementCycle(cardCycles);

        const now = new Date();
        const currentMonthKey = format(now, 'yyyy-MM');

        const unpaidInvoices = cardInvoices.filter(inv => inv.status !== 'paid');
        const totalUsage = unpaidInvoices.reduce((acc, inv) => acc + (Number(inv.total_amount) - Number(inv.paid_amount)), 0);

        const currentInvoiceData = cardInvoices.find(inv => inv.month_key === currentMonthKey);
        const currentInvoice = currentInvoiceData
            ? Number(currentInvoiceData.total_amount) - Number(currentInvoiceData.paid_amount)
            : 0;

        return {
            ...cardRow,
            transactions: cardTransactions,
            invoices: cardInvoices,
            statement_cycles: cardCycles,
            current_statement_cycle: currentCycle,
            usage: totalUsage,
            current_invoice: currentInvoice,
            available_limit: Number(cardRow.credit_limit) - totalUsage,
        } as CreditCardDetails;
    },
};
