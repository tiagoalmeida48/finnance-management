import { supabase } from '@/lib/supabase/client';
import type { Transaction } from '../interfaces';
import { filterGroupUpdates } from './transactionsGroup.utils';

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
    return data as Transaction[];
}

export async function batchDeleteTransactions(ids: string[], syncBalance: SyncBalanceFn) {
    const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .in('id', ids);

    if (transactions) {
        for (const transaction of transactions) {
            await syncBalance(transaction as Transaction, 'remove');
        }
    }

    const { error } = await supabase
        .from('transactions')
        .delete()
        .in('id', ids);

    if (error) throw error;
}

export async function deleteTransactionById(id: string, syncBalance: SyncBalanceFn) {
    const { data: transaction, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single();

    if (fetchError) throw fetchError;

    await syncBalance(transaction as Transaction, 'remove');

    const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

export async function deleteTransactionGroup(groupId: string, type: 'installment' | 'recurring', syncBalance: SyncBalanceFn) {
    const { data: transactions, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq(type === 'installment' ? 'installment_group_id' : 'recurring_group_id', groupId);

    if (fetchError) throw fetchError;

    if (transactions) {
        for (const transaction of transactions) {
            await syncBalance(transaction as Transaction, 'remove');
        }
    }

    const { error } = await supabase
        .from('transactions')
        .update({ deleted_at: new Date().toISOString() })
        .eq(type === 'installment' ? 'installment_group_id' : 'recurring_group_id', groupId);

    if (error) throw error;
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

    const { data: oldTransactions } = await supabase
        .from('transactions')
        .select('*')
        .eq(column, groupId);

    if (oldTransactions) {
        for (const transaction of oldTransactions) {
            await syncBalance(transaction as Transaction, 'remove');
        }
    }

    const allowedUpdates = filterGroupUpdates(updates);

    const { data, error } = await supabase
        .from('transactions')
        .update({ ...allowedUpdates, updated_at: new Date().toISOString() })
        .eq(column, groupId)
        .select();

    if (error) throw error;
    const updatedTransactions = data as Transaction[];

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
