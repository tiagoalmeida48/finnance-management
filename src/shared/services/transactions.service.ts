import { supabase } from '@/lib/supabase/client';
import { addMonths, format } from 'date-fns';
import { accountsService } from './accounts.service';
import { Transaction, CreateTransactionData } from '../interfaces';
import {
    batchDeleteTransactions,
    batchPayTransactions,
    batchUnpayTransactions,
    deleteTransactionById,
    deleteTransactionGroup,
    getFirstTransactionDate as fetchFirstTransactionDate,
    payCardBill,
    updateTransactionGroup,
} from './transactions-operations.service';

type TransactionMutationData = Partial<Transaction> & {
    installment_amounts?: number[];
    repeat_count?: number;
    is_installment?: boolean;
};

type TransactionInsertPayload = TransactionMutationData & { user_id: string };

const sanitizePayload = <T extends Record<string, unknown>>(data: T): T => {
    const uuidFields = ['category_id', 'account_id', 'to_account_id', 'card_id', 'installment_group_id', 'recurring_group_id'] as const;
    const sanitized = { ...data };
    const sanitizedRecord = sanitized as Record<string, unknown>;

    uuidFields.forEach(field => {
        if (sanitizedRecord[field] === '') {
            sanitizedRecord[field] = null;
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
            const transactionsToCreate: TransactionInsertPayload[] = [];
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
                delete t.installment_amounts;
                delete t.repeat_count;
                delete t.is_installment;
            });

            const { data, error } = await supabase.from('transactions').insert(transactionsToCreate).select();
            if (error) throw error;

            if (data) {
                for (const t of data) {
                    await syncBalance(t as Transaction, 'add');
                }
            }

            return (data as Transaction[])[0];
        }

        if (transaction.is_fixed && repeatCount > 1) {
            const recurringGroupId = crypto.randomUUID();
            const transactionsToCreate: TransactionInsertPayload[] = [];
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
                delete t.installment_amounts;
                delete t.repeat_count;
                delete t.is_installment;
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

        const payload: TransactionInsertPayload = sanitizePayload({ ...transaction, user_id: user.id });
        delete payload.installment_amounts;
        delete payload.repeat_count;
        delete payload.is_installment;

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

        const payloads: TransactionInsertPayload[] = transactions.map(t => sanitizePayload({ ...t, user_id: user.id }));

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
        return batchPayTransactions(ids, accountId, paymentDate, syncBalance);
    },

    async batchUnpay(ids: string[]) {
        return batchUnpayTransactions(ids, syncBalance);
    },

    async batchDelete(ids: string[]) {
        return batchDeleteTransactions(ids, syncBalance);
    },

    async delete(id: string) {
        return deleteTransactionById(id, syncBalance);
    },

    async deleteGroup(groupId: string, type: 'installment' | 'recurring') {
        return deleteTransactionGroup(groupId, type, syncBalance);
    },

    async payBill(cardId: string, transactionIds: string[], accountId: string, paymentDate: string, amount: number, description: string) {
        return payCardBill(cardId, transactionIds, accountId, paymentDate, amount, description, syncBalance);
    },

    async updateGroup(groupId: string, type: 'installment' | 'recurring', updates: Partial<Transaction>) {
        return updateTransactionGroup(groupId, type, updates, syncBalance);
    },

    async getFirstTransactionDate() {
        return fetchFirstTransactionDate();
    },
};
export type { Transaction };

