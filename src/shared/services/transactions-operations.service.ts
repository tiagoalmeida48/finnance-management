import { supabase } from '@/lib/supabase/client';
import type { Transaction } from '../interfaces';
import { invoicesService } from './invoices.service';
import { extractDayFromDateLike, filterGroupUpdates, replaceDateDayPreservingMonth } from './transactionsGroup.utils';

type SyncBalanceFn = (transaction: Transaction, action: 'add' | 'remove', force?: boolean) => Promise<void>;

export async function batchPayTransactions(
    ids: string[],
    accountId: string,
    paymentDate: string,
    syncBalance: SyncBalanceFn,
) {
    const { data, error } = await supabase
        .from('transactions')
        .update({
            is_paid: true,
            account_id: accountId,
            payment_date: paymentDate,
            updated_at: new Date().toISOString()
        })
        .in('id', ids)
        .select();

    if (error) throw error;
    const updated = data as Transaction[];
    for (const transaction of updated) {
        await syncBalance(transaction, 'add');
    }

    const invoiceIds = [...new Set(updated.filter(t => t.invoice_id).map(t => t.invoice_id!))];
    for (const invoiceId of invoiceIds) {
        await invoicesService.recalculateInvoiceTotal(invoiceId);
    }

    return updated;
}

export async function batchUnpayTransactions(ids: string[], syncBalance: SyncBalanceFn) {
    const { data: oldTransactions } = await supabase
        .from('transactions')
        .select('*')
        .in('id', ids);

    if (oldTransactions) {
        for (const transaction of oldTransactions) {
            await syncBalance(transaction as Transaction, 'remove');
        }
    }

    const { data, error } = await supabase
        .from('transactions')
        .update({
            is_paid: false,
            updated_at: new Date().toISOString()
        })
        .in('id', ids)
        .select();

    if (error) throw error;
    const updated = data as Transaction[];

    const invoiceIds = [...new Set(updated.filter(t => t.invoice_id).map(t => t.invoice_id!))];
    for (const invoiceId of invoiceIds) {
        await invoicesService.recalculateInvoiceTotal(invoiceId);
    }

    return updated;
}

export async function batchDeleteTransactions(ids: string[], syncBalance: SyncBalanceFn) {
    const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .in('id', ids);

    const invoiceIdsToRecalculate: Set<string> = new Set();

    if (transactions) {
        for (const transaction of transactions) {
            const t = transaction as Transaction;
            await syncBalance(t, 'remove');
            if (t.invoice_id) invoiceIdsToRecalculate.add(t.invoice_id);
        }
    }

    const { error } = await supabase
        .from('transactions')
        .delete()
        .in('id', ids);

    if (error) throw error;

    for (const invoiceId of invoiceIdsToRecalculate) {
        await invoicesService.recalculateInvoiceTotal(invoiceId);
    }
}

export async function deleteTransactionById(id: string, syncBalance: SyncBalanceFn) {
    const { data: transaction, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single();

    if (fetchError) throw fetchError;

    const t = transaction as Transaction;
    await syncBalance(t, 'remove');

    const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

    if (error) throw error;

    if (t.invoice_id) {
        await invoicesService.recalculateInvoiceTotal(t.invoice_id);
    }
}

export async function deleteTransactionGroup(groupId: string, type: 'installment' | 'recurring', syncBalance: SyncBalanceFn) {
    const groupColumn = type === 'installment' ? 'installment_group_id' : 'recurring_group_id';

    const { data: transactions, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq(groupColumn, groupId);

    if (fetchError) throw fetchError;

    const invoiceIdsToRecalculate: Set<string> = new Set();

    if (transactions) {
        for (const transaction of transactions) {
            const t = transaction as Transaction;
            await syncBalance(t, 'remove');
            if (t.invoice_id) invoiceIdsToRecalculate.add(t.invoice_id);
        }
    }

    const { error } = await supabase
        .from('transactions')
        .delete()
        .eq(groupColumn, groupId);

    if (error) throw error;

    for (const invoiceId of invoiceIdsToRecalculate) {
        await invoicesService.recalculateInvoiceTotal(invoiceId);
    }
}

export async function payCardBill(
    cardId: string,
    transactionIds: string[],
    accountId: string,
    paymentDate: string,
    amount: number,
    description: string,
    syncBalance: SyncBalanceFn,
) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: paymentTransaction, error: paymentError } = await supabase
        .from('transactions')
        .insert({
            user_id: user.id,
            description: `Pgto Fatura: ${description}`,
            amount: Math.abs(amount),
            type: 'expense',
            payment_date: paymentDate,
            account_id: accountId,
            is_paid: true,
            notes: `Pagamento de fatura do cartão ID: ${cardId}`
        })
        .select()
        .single();

    if (paymentError) throw paymentError;

    const { error: updateError } = await supabase
        .from('transactions')
        .update({ is_paid: true, updated_at: new Date().toISOString() })
        .in('id', transactionIds);

    if (updateError) throw updateError;

    const { data: updatedTransactions } = await supabase
        .from('transactions')
        .select('invoice_id')
        .in('id', transactionIds);

    const invoiceIds = [...new Set(
        (updatedTransactions ?? [])
            .filter((t: { invoice_id: string | null }) => t.invoice_id)
            .map((t: { invoice_id: string | null }) => t.invoice_id!)
    )];

    for (const invoiceId of invoiceIds) {
        await invoicesService.recalculateInvoiceTotal(invoiceId);
    }

    await syncBalance(paymentTransaction as Transaction, 'add');
    return paymentTransaction as Transaction;
}

export async function updateTransactionGroup(
    groupId: string,
    type: 'installment' | 'recurring',
    updates: Partial<Transaction>,
    syncBalance: SyncBalanceFn,
) {
    const column = type === 'installment' ? 'installment_group_id' : 'recurring_group_id';

    const { data: oldTransactions, error: oldTransactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq(column, groupId);
    if (oldTransactionsError) throw oldTransactionsError;

    const transactionsBeforeUpdate = (oldTransactions ?? []) as Transaction[];
    if (transactionsBeforeUpdate.length === 0) return [];

    const updatesWithoutDate = { ...updates };
    delete updatesWithoutDate.payment_date;
    delete updatesWithoutDate.purchase_date;

    const allowedUpdates = filterGroupUpdates(updatesWithoutDate);
    const targetPaymentDay = extractDayFromDateLike(updates.payment_date);
    const targetPurchaseDay = extractDayFromDateLike(updates.purchase_date) ?? targetPaymentDay;
    const shouldAdjustDates = targetPaymentDay !== null || targetPurchaseDay !== null;

    const timestamp = new Date().toISOString();
    let updatedTransactions: Transaction[] = [];

    if (shouldAdjustDates) {
        updatedTransactions = await Promise.all(
            transactionsBeforeUpdate.map(async (transaction) => {
                const perTransactionDateUpdates: Partial<Transaction> = {};

                if (targetPaymentDay !== null) {
                    const nextPaymentDate = replaceDateDayPreservingMonth(transaction.payment_date, targetPaymentDay);
                    if (nextPaymentDate) {
                        perTransactionDateUpdates.payment_date = nextPaymentDate;
                    }
                }

                if (targetPurchaseDay !== null && transaction.purchase_date) {
                    const nextPurchaseDate = replaceDateDayPreservingMonth(transaction.purchase_date, targetPurchaseDay);
                    if (nextPurchaseDate) {
                        perTransactionDateUpdates.purchase_date = nextPurchaseDate;
                    }
                }

                const { data: updatedTransaction, error: updateError } = await supabase
                    .from('transactions')
                    .update({ ...allowedUpdates, ...perTransactionDateUpdates, updated_at: timestamp })
                    .eq('id', transaction.id)
                    .select()
                    .single();

                if (updateError) throw updateError;
                return updatedTransaction as Transaction;
            }),
        );
    } else {
        const { data, error } = await supabase
            .from('transactions')
            .update({ ...allowedUpdates, updated_at: timestamp })
            .eq(column, groupId)
            .select();

        if (error) throw error;
        updatedTransactions = data as Transaction[];
    }

    for (const transaction of transactionsBeforeUpdate) {
        await syncBalance(transaction, 'remove');
    }

    for (const transaction of updatedTransactions) {
        await syncBalance(transaction, 'add');
    }

    return updatedTransactions;
}

export async function getFirstTransactionDate() {
    const { data, error } = await supabase
        .from('transactions')
        .select('payment_date')
        .order('payment_date', { ascending: true })
        .limit(1)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data?.payment_date || null;
}
