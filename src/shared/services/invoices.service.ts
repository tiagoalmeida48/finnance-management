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
};
