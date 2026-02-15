import { format } from 'date-fns';
import { supabase } from '@/lib/supabase/client';
import type { CreditCardInvoice } from '../interfaces';
import {
    getCurrentStatementCycle,
    resolveStatementMonth,
    sortStatementCyclesAsc,
} from './card-statement-cycle.utils';
import type { CreditCardStatementCycle, Transaction } from '../interfaces';

interface ResolveInvoiceInput {
    transaction: Pick<Transaction, 'purchase_date' | 'payment_date'>;
    cardId: string;
    userId: string;
    closingDay: number;
    dueDay: number;
}

const buildClosingAndDueDate = (monthKey: string, closingDay: number, dueDay: number) => {
    const baseDate = new Date(`${monthKey}-01T12:00:00`);
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();

    const lastDay = new Date(year, month + 1, 0).getDate();
    const clampedClosing = Math.min(closingDay, lastDay);
    const clampedDue = Math.min(dueDay, lastDay);

    const closingDate = format(new Date(year, month, clampedClosing), 'yyyy-MM-dd');
    const dueDate = format(new Date(year, month, clampedDue), 'yyyy-MM-dd');

    return { closingDate, dueDate };
};

export const invoicesService = {
    async getByCardId(cardId: string, filters?: { year?: string }) {
        let query = supabase
            .from('credit_card_invoices')
            .select('*')
            .eq('card_id', cardId)
            .order('month_key', { ascending: false });

        if (filters?.year) {
            query = query
                .gte('month_key', `${filters.year}-01`)
                .lte('month_key', `${filters.year}-12`);
        }

        const { data, error } = await query;
        if (error) throw error;
        return (data ?? []) as CreditCardInvoice[];
    },

    async getByMonthKey(cardId: string, monthKey: string) {
        const { data, error } = await supabase
            .from('credit_card_invoices')
            .select('*')
            .eq('card_id', cardId)
            .eq('month_key', monthKey)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return (data as CreditCardInvoice) || null;
    },

    async resolveOrCreateInvoice(input: ResolveInvoiceInput): Promise<CreditCardInvoice | null> {
        const { transaction, cardId, userId, closingDay, dueDay } = input;

        const { data: cycles } = await supabase
            .from('credit_card_statement_cycles')
            .select('*')
            .eq('card_id', cardId)
            .order('date_start', { ascending: true });

        const cardCycles = sortStatementCyclesAsc((cycles ?? []) as CreditCardStatementCycle[]);
        const currentCycle = getCurrentStatementCycle(cardCycles);

        const fallbackCycle = {
            closing_day: Number(currentCycle?.closing_day ?? closingDay),
            due_day: Number(currentCycle?.due_day ?? dueDay),
        };

        const resolved = resolveStatementMonth(transaction, cardCycles, fallbackCycle);
        if (!resolved) return null;

        const monthKey = resolved.statementMonthKey;
        const { closingDate, dueDate } = buildClosingAndDueDate(monthKey, fallbackCycle.closing_day, fallbackCycle.due_day);

        const { data: existing } = await supabase
            .from('credit_card_invoices')
            .select('*')
            .eq('card_id', cardId)
            .eq('month_key', monthKey)
            .single();

        if (existing) return existing as CreditCardInvoice;

        const { data: created, error } = await supabase
            .from('credit_card_invoices')
            .insert({
                user_id: userId,
                card_id: cardId,
                month_key: monthKey,
                closing_date: closingDate,
                due_date: dueDate,
            })
            .select()
            .single();

        if (error) throw error;
        return created as CreditCardInvoice;
    },

    async linkTransactionToInvoice(invoiceId: string, transactionId: string) {
        await supabase
            .from('transactions')
            .update({ invoice_id: invoiceId })
            .eq('id', transactionId);

        await invoicesService.recalculateInvoiceTotal(invoiceId);
    },

    async unlinkTransactionFromInvoice(invoiceId: string, transactionId: string) {
        await supabase
            .from('transactions')
            .update({ invoice_id: null })
            .eq('id', transactionId);

        await invoicesService.recalculateInvoiceTotal(invoiceId);
    },

    async recalculateInvoiceTotal(invoiceId: string) {
        const { data: transactions, error: txError } = await supabase
            .from('transactions')
            .select('amount, type, is_paid')
            .eq('invoice_id', invoiceId);

        if (txError) throw txError;

        let totalAmount = 0;
        let paidAmount = 0;

        for (const tx of (transactions ?? [])) {
            const amount = Number(tx.amount) || 0;
            const effectiveAmount = tx.type === 'income' ? -amount : amount;

            totalAmount += effectiveAmount;
            if (tx.is_paid) {
                paidAmount += effectiveAmount;
            }
        }

        let status: string = 'open';
        if (paidAmount >= totalAmount && totalAmount > 0) {
            status = 'paid';
        } else if (paidAmount > 0 && paidAmount < totalAmount) {
            status = 'partial';
        }

        const { error } = await supabase
            .from('credit_card_invoices')
            .update({
                total_amount: totalAmount,
                paid_amount: paidAmount,
                status,
                paid_at: status === 'paid' ? new Date().toISOString() : null,
            })
            .eq('id', invoiceId);

        if (error) throw error;
    },

    async recalculateInvoiceByCardAndMonth(cardId: string, monthKey: string) {
        const invoice = await invoicesService.getByMonthKey(cardId, monthKey);
        if (invoice) {
            await invoicesService.recalculateInvoiceTotal(invoice.id);
        }
    },

    async reprocessInvoicesFromDate(cardId: string, fromDate: string) {
        const [{ data: cardData }, { data: authData }, { data: cycles }, { data: transactions }, { data: existingInvoices }] = await Promise.all([
            supabase.from('credit_cards').select('closing_day, due_day').eq('id', cardId).single(),
            supabase.auth.getUser(),
            supabase.from('credit_card_statement_cycles').select('*').eq('card_id', cardId).order('date_start', { ascending: true }),
            supabase.from('transactions').select('id, payment_date, purchase_date, invoice_id').eq('card_id', cardId).or(`payment_date.gte.${fromDate},purchase_date.gte.${fromDate}`),
            supabase.from('credit_card_invoices').select('*').eq('card_id', cardId),
        ]);

        if (!cardData) return;
        const userId = authData.user?.id;
        if (!userId) return;
        if (!transactions || transactions.length === 0) return;

        const closingDay = Number(cardData.closing_day);
        const dueDay = Number(cardData.due_day);
        const cardCycles = sortStatementCyclesAsc((cycles ?? []) as CreditCardStatementCycle[]);
        const currentCycle = getCurrentStatementCycle(cardCycles);
        const fallbackCycle = {
            closing_day: Number(currentCycle?.closing_day ?? closingDay),
            due_day: Number(currentCycle?.due_day ?? dueDay),
        };

        const invoicesByMonthKey = new Map<string, CreditCardInvoice>();
        for (const inv of (existingInvoices ?? []) as CreditCardInvoice[]) {
            invoicesByMonthKey.set(inv.month_key, inv);
        }

        const txToMonthKey = new Map<string, string>();
        const neededMonthKeys = new Set<string>();

        for (const tx of transactions) {
            const resolved = resolveStatementMonth(
                { purchase_date: tx.purchase_date, payment_date: tx.payment_date },
                cardCycles,
                fallbackCycle,
            );
            if (!resolved) continue;
            txToMonthKey.set(tx.id, resolved.statementMonthKey);
            if (!invoicesByMonthKey.has(resolved.statementMonthKey)) {
                neededMonthKeys.add(resolved.statementMonthKey);
            }
        }

        for (const monthKey of neededMonthKeys) {
            const { closingDate, dueDate: dueDateVal } = buildClosingAndDueDate(monthKey, fallbackCycle.closing_day, fallbackCycle.due_day);
            const { data: created } = await supabase
                .from('credit_card_invoices')
                .insert({ user_id: userId, card_id: cardId, month_key: monthKey, closing_date: closingDate, due_date: dueDateVal })
                .select()
                .single();
            if (created) invoicesByMonthKey.set(monthKey, created as CreditCardInvoice);
        }

        const affectedInvoiceIds = new Set<string>();
        const updatesByInvoiceId = new Map<string, string[]>();

        for (const tx of transactions) {
            const targetMonthKey = txToMonthKey.get(tx.id);
            if (!targetMonthKey) continue;

            const targetInvoice = invoicesByMonthKey.get(targetMonthKey);
            if (!targetInvoice) continue;

            if (tx.invoice_id === targetInvoice.id) continue;

            if (tx.invoice_id) affectedInvoiceIds.add(tx.invoice_id);
            affectedInvoiceIds.add(targetInvoice.id);

            const batch = updatesByInvoiceId.get(targetInvoice.id) ?? [];
            batch.push(tx.id);
            updatesByInvoiceId.set(targetInvoice.id, batch);
        }

        const updatePromises = Array.from(updatesByInvoiceId.entries()).map(([invoiceId, txIds]) =>
            supabase.from('transactions').update({ invoice_id: invoiceId }).in('id', txIds)
        );
        await Promise.all(updatePromises);

        const recalcPromises = Array.from(affectedInvoiceIds).map((id) =>
            invoicesService.recalculateInvoiceTotal(id)
        );
        await Promise.all(recalcPromises);

        const invoiceIds = Array.from(invoicesByMonthKey.values()).map((inv) => inv.id);
        if (invoiceIds.length > 0) {
            const { data: invoicesWithTx } = await supabase
                .from('transactions')
                .select('invoice_id')
                .in('invoice_id', invoiceIds);

            const usedIds = new Set((invoicesWithTx ?? []).map((r) => r.invoice_id));
            const emptyIds = invoiceIds.filter((id) => !usedIds.has(id));

            if (emptyIds.length > 0) {
                await supabase.from('credit_card_invoices').delete().in('id', emptyIds);
            }
        }
    },
};
