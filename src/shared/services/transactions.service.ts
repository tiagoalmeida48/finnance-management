import { supabase } from '@/lib/supabase/client';
import { addMonths, format } from 'date-fns';
import { accountsService } from './accounts.service';
import { Transaction, CreateTransactionData } from '../interfaces';

const sanitizePayload = (data: any) => {
    const uuidFields = ['category_id', 'account_id', 'to_account_id', 'card_id', 'installment_group_id', 'recurring_group_id'];
    const sanitized = { ...data };
    uuidFields.forEach(field => {
        if (sanitized[field] === '') {
            sanitized[field] = null;
        }
    });
    return sanitized;
};

const syncBalance = async (transaction: Transaction, action: 'add' | 'remove', force = false) => {
    if (!transaction.account_id) return;
    if (!force && !transaction.is_paid) return;

    const multiplier = action === 'add' ? 1 : -1;
    const amount = Number(transaction.amount);

    if (transaction.type === 'income') {
        await accountsService.adjustBalance(transaction.account_id, amount * multiplier);
    } else if (transaction.type === 'expense') {
        await accountsService.adjustBalance(transaction.account_id, -amount * multiplier);
    } else if (transaction.type === 'transfer') {
        await accountsService.adjustBalance(transaction.account_id, -amount * multiplier);
        if (transaction.to_account_id) {
            await accountsService.adjustBalance(transaction.to_account_id, amount * multiplier);
        }
    }
};

export const transactionsService = {
    async getAll(filters?: { account_id?: string; category_id?: string; start_date?: string; end_date?: string; is_paid?: boolean }) {
        let query = supabase
            .from('transactions')
            .select('*, bank_account:account_id(name), to_bank_account:to_account_id(name), category:category_id(name, color, icon), credit_card:card_id(name)')
            .order('payment_date', { ascending: false });

        if (filters?.account_id) query = query.eq('account_id', filters.account_id);
        if (filters?.category_id) query = query.eq('category_id', filters.category_id);
        if (filters?.start_date) query = query.gte('payment_date', filters.start_date);
        if (filters?.end_date) query = query.lte('payment_date', filters.end_date);
        if (filters?.is_paid !== undefined) query = query.eq('is_paid', filters.is_paid);

        const { data, error } = await query;
        if (error) throw error;
        return data as Transaction[];
    },

    async getById(id: string) {
        const { data, error } = await supabase
            .from('transactions')
            .select('*, bank_account:account_id(name), to_bank_account:to_account_id(name), category:category_id(name, color, icon), credit_card:card_id(name)')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Transaction;
    },

    async create(transaction: CreateTransactionData) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const totalInstallments = transaction.is_installment ? (transaction.total_installments || 1) : 1;
        const repeatCount = transaction.is_fixed ? (transaction.repeat_count || 1) : 1;
        const isInstallment = transaction.is_installment || (transaction.total_installments && transaction.total_installments > 1);

        if (isInstallment && totalInstallments > 1) {
            const installmentGroupId = crypto.randomUUID();
            const transactionsToCreate = [];
            const baseDate = new Date(transaction.payment_date + 'T12:00:00');

            for (let i = 1; i <= totalInstallments; i++) {
                const installmentDate = addMonths(baseDate, i - 1);
                const installmentDescription = `${transaction.description} (${i.toString().padStart(2, '0')}/${totalInstallments.toString().padStart(2, '0')})`;
                const currentAmount = transaction.installment_amounts?.[i - 1] ?? transaction.amount;

                transactionsToCreate.push(sanitizePayload({
                    ...transaction,
                    user_id: user.id,
                    description: installmentDescription,
                    amount: currentAmount,
                    payment_date: format(installmentDate, 'yyyy-MM-dd'),
                    installment_group_id: installmentGroupId,
                    installment_number: i,
                    total_installments: totalInstallments,
                    is_paid: transaction.card_id ? false : (i === 1 ? transaction.is_paid : false)
                }));
            }

            transactionsToCreate.forEach(t => {
                delete (t as any).installment_amounts;
                delete (t as any).repeat_count;
                delete (t as any).is_installment;
            });

            const { data, error } = await supabase.from('transactions').insert(transactionsToCreate).select();
            if (error) throw error;

            if (data) {
                for (const t of data) {
                    await syncBalance(t as Transaction, 'add');
                }
            }

            return (data as any[])[0] as Transaction;
        }

        if (transaction.is_fixed && repeatCount > 1) {
            const recurringGroupId = crypto.randomUUID();
            const transactionsToCreate = [];
            const baseDate = new Date(transaction.payment_date + 'T12:00:00');

            for (let i = 0; i < repeatCount; i++) {
                const recurrenceDate = addMonths(baseDate, i);
                transactionsToCreate.push(sanitizePayload({
                    ...transaction,
                    user_id: user.id,
                    payment_date: format(recurrenceDate, 'yyyy-MM-dd'),
                    recurring_group_id: recurringGroupId,
                    is_paid: i === 0 ? transaction.is_paid : false
                }));
            }

            transactionsToCreate.forEach(t => {
                delete (t as any).installment_amounts;
                delete (t as any).repeat_count;
                delete (t as any).is_installment;
            });

            const { data, error } = await supabase.from('transactions').insert(transactionsToCreate).select();
            if (error) throw error;

            if (data) {
                for (const t of data) {
                    await syncBalance(t as Transaction, 'add');
                }
            }

            return data[0] as Transaction;
        }

        const payload = sanitizePayload({ ...transaction, user_id: user.id });
        delete (payload as any).installment_amounts;
        delete (payload as any).repeat_count;
        delete (payload as any).is_installment;

        const { data, error } = await supabase
            .from('transactions')
            .insert(payload)
            .select()
            .single();

        if (error) throw error;
        const created = data as Transaction;
        await syncBalance(created, 'add');
        return created;
    },

    async batchCreate(transactions: Partial<Transaction>[]) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const payloads = transactions.map(t => sanitizePayload({ ...t, user_id: user.id }));

        const { data, error } = await supabase
            .from('transactions')
            .insert(payloads)
            .select();

        if (error) throw error;

        if (data) {
            for (const t of data) {
                await syncBalance(t as Transaction, 'add');
            }
        }

        return data as Transaction[];
    },

    async update(id: string, updates: Partial<Transaction>) {
        const oldTransaction = await transactionsService.getById(id);

        const { data, error } = await supabase
            .from('transactions')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        const updated = data as Transaction;

        await syncBalance(oldTransaction, 'remove');
        await syncBalance(updated, 'add');

        return updated;
    },

    async togglePaymentStatus(id: string, currentStatus: boolean) {
        const { data, error } = await supabase
            .from('transactions')
            .update({ is_paid: !currentStatus, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        const updated = data as Transaction;

        if (currentStatus) {
            await syncBalance(updated, 'remove', true);
        } else {
            await syncBalance(updated, 'add');
        }

        return updated;
    },

    async batchPay(ids: string[], accountId: string, paymentDate: string) {
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
        for (const t of updated) {
            await syncBalance(t, 'add');
        }
        return updated;
    },

    async batchUnpay(ids: string[]) {
        const { data: oldTransactions } = await supabase
            .from('transactions')
            .select('*')
            .in('id', ids);

        if (oldTransactions) {
            for (const t of oldTransactions) {
                await syncBalance(t as Transaction, 'remove');
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
    },

    async batchDelete(ids: string[]) {
        const { data: transactions } = await supabase
            .from('transactions')
            .select('*')
            .in('id', ids);

        if (transactions) {
            for (const t of transactions) {
                await syncBalance(t as Transaction, 'remove');
            }
        }

        const { error } = await supabase
            .from('transactions')
            .delete()
            .in('id', ids);

        if (error) throw error;
    },

    async delete(id: string) {
        const transaction = await transactionsService.getById(id);
        await syncBalance(transaction, 'remove');

        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async deleteGroup(groupId: string, type: 'installment' | 'recurring') {
        const { data: transactions, error: fetchError } = await supabase
            .from('transactions')
            .select('*')
            .eq(type === 'installment' ? 'installment_group_id' : 'recurring_group_id', groupId);

        if (fetchError) throw fetchError;

        if (transactions) {
            for (const t of transactions) {
                await syncBalance(t as Transaction, 'remove');
            }
        }

        const { error } = await supabase
            .from('transactions')
            .update({ deleted_at: new Date().toISOString() })
            .eq(type === 'installment' ? 'installment_group_id' : 'recurring_group_id', groupId);

        if (error) throw error;
    },

    async payBill(cardId: string, transactionIds: string[], accountId: string, paymentDate: string, amount: number, description: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const paymentPayload = sanitizePayload({
            user_id: user.id,
            description: `Pgto Fatura: ${description}`,
            amount: Math.abs(amount),
            type: 'expense',
            payment_date: paymentDate,
            account_id: accountId,
            is_paid: true,
            notes: `Pagamento de fatura do cartão ID: ${cardId}`
        });

        const { data: paymentTransaction, error: paymentError } = await supabase
            .from('transactions')
            .insert(paymentPayload)
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
    },

    async updateGroup(groupId: string, type: 'installment' | 'recurring', updates: Partial<Transaction>) {
        const column = type === 'installment' ? 'installment_group_id' : 'recurring_group_id';

        const { data: oldTransactions } = await supabase
            .from('transactions')
            .select('*')
            .eq(column, groupId);

        if (oldTransactions) {
            for (const t of oldTransactions) {
                await syncBalance(t as Transaction, 'remove');
            }
        }

        const {
            id,
            payment_date,
            installment_number,
            installment_group_id,
            recurring_group_id,
            created_at,
            user_id,
            ...allowedUpdates
        } = updates as any;

        const { data, error } = await supabase
            .from('transactions')
            .update({ ...allowedUpdates, updated_at: new Date().toISOString() })
            .eq(column, groupId)
            .select();

        if (error) throw error;
        const updatedTransactions = data as Transaction[];

        for (const t of updatedTransactions) {
            await syncBalance(t, 'add');
        }

        return updatedTransactions;
    },

    async getFirstTransactionDate() {
        const { data, error } = await supabase
            .from('transactions')
            .select('payment_date')
            .order('payment_date', { ascending: true })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data?.payment_date || null;
    }
};
export type { Transaction };

