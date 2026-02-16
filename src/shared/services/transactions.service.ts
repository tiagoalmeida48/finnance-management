import { supabase } from '@/lib/supabase/client';
import { Transaction, CreateTransactionData } from '../interfaces';

export const transactionsService = {
    async getAll(filters?: { account_id?: string; category_id?: string; start_date?: string; end_date?: string; is_paid?: boolean }) {
        const pageSize = 1000;
        let from = 0;
        const allTransactions: Transaction[] = [];

        while (true) {
            let query = supabase
                .from('transactions')
                .select('*, bank_account:account_id(name), to_bank_account:to_account_id(name), category:category_id(name, color, icon), credit_card:card_id(name, color)')
                .order('payment_date', { ascending: false })
                .range(from, from + pageSize - 1);

            if (filters?.account_id) query = query.eq('account_id', filters.account_id);
            if (filters?.category_id) query = query.eq('category_id', filters.category_id);
            if (filters?.start_date) query = query.gte('payment_date', filters.start_date);
            if (filters?.end_date) query = query.lte('payment_date', filters.end_date);
            if (filters?.is_paid !== undefined) query = query.eq('is_paid', filters.is_paid);

            const { data, error } = await query;
            if (error) throw error;

            const page = (data ?? []) as Transaction[];
            allTransactions.push(...page);

            if (page.length < pageSize) break;
            from += pageSize;
        }

        return allTransactions;
    },

    async getById(id: string) {
        const { data, error } = await supabase
            .from('transactions')
            .select('*, bank_account:account_id(name), to_bank_account:to_account_id(name), category:category_id(name, color, icon), credit_card:card_id(name, color)')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Transaction;
    },

    async create(transaction: CreateTransactionData) {
        const { data, error } = await supabase.functions.invoke('manage-transactions', {
            body: { action: 'create', payload: transaction }
        });

        if (error) throw error;
        return data as Transaction;
    },

    async batchCreate(transactions: Partial<Transaction>[]) {
        // Implement batch create in Edge Function if needed, currently not used heavily or loop in EF?
        // For now, let's just loop locally or add batch-create action.
        // Given complexity, let's loop locally invoking create (slower) or add to EF.
        // "batchCreate" was used for importing? 
        // Let's implement 'batch-create' action in EF? 
        // EF didn't implement 'batch-create'.
        // Let's fallback to looping for now to save complexity on EF side without user request.

        const created: Transaction[] = [];
        for (const t of transactions) {
            const res = await this.create(t as CreateTransactionData);
            created.push(res);
        }
        return created;
    },

    async update(id: string, updates: Partial<Transaction>) {
        const { data, error } = await supabase.functions.invoke('manage-transactions', {
            body: { action: 'update', payload: { id, updates } }
        });

        if (error) throw error;
        return data as Transaction;
    },

    async togglePaymentStatus(id: string, currentStatus: boolean) {
        // Toggling is just updating is_paid
        const { data, error } = await supabase.functions.invoke('manage-transactions', {
            body: { action: 'update', payload: { id, updates: { is_paid: !currentStatus } } }
        });

        if (error) throw error;
        return data as Transaction;
    },

    async batchPay(ids: string[], accountId: string, paymentDate: string) {
        const { data, error } = await supabase.functions.invoke('manage-transactions', {
            body: { action: 'batch-pay', payload: { ids, accountId, paymentDate } }
        });
        if (error) throw error;
        return data as Transaction[];
    },

    async batchUnpay(ids: string[]) {
        const { data, error } = await supabase.functions.invoke('manage-transactions', {
            body: { action: 'batch-unpay', payload: { ids } }
        });
        if (error) throw error;
        return data as Transaction[];
    },

    async batchDelete(ids: string[]) {
        // Loop or add batch-delete to EF.
        // 'delete' action in EF handles single.
        // Let's loop.
        const promises = ids.map(id => this.delete(id));
        await Promise.all(promises);
    },

    async delete(id: string) {
        const { error } = await supabase.functions.invoke('manage-transactions', {
            body: { action: 'delete', payload: { id } }
        });
        if (error) throw error;
    },

    async deleteGroup(groupId: string, type: 'installment' | 'recurring') {
        const { error } = await supabase.functions.invoke('manage-transactions', {
            body: { action: 'delete-group', payload: { groupId, type } }
        });
        if (error) throw error;
    },

    async payBill(_cardId: string, transactionIds: string[], accountId: string, paymentDate: string, amount: number, description: string) {
        // Utilize cardId if needed for logging or future logic, but mainly we create a payment transaction.
        // Or just remove cardId if totally unused.
        // The signature is public, so let's keep it but ignore lint.
        // Or pass it in category_id if needed? No.
        // Since Edge Function 'batch-pay' doesn't strictly need cardId unless we want to validate?
        // Let's pass it to EF 'pay-bill' action? 
        // EF doesn't have 'pay-bill' action yet, but we composed creates.
        // cardId is logically unused here because the transaction IDs specify what is being paid.

        // 1. Create Payment Transaction
        await this.create({
            description,
            amount,
            type: 'expense',
            account_id: accountId,
            payment_date: paymentDate,
            is_paid: true,
            is_fixed: false,
            category_id: null // Or "Credit Card Payment" category?
        } as CreateTransactionData);

        // 2. Batch Update transactions
        await this.batchPay(transactionIds, accountId, paymentDate);
    },

    async updateGroup(groupId: string, type: 'installment' | 'recurring', updates: Partial<Transaction>) {
        // EF doesn't have update-group yet.
        // We should add it or loop.
        // Updating a group is complex (update all futures).
        // Ideally EF should handle it.
        // Let's add 'update-group' to EF??? 
        // EF source code I wrote doesn't have it.
        // For now, fail safely or implement simple loop?
        // Let's implement loop here (fetch Ids -> update loop).

        const column = type === 'installment' ? 'installment_group_id' : 'recurring_group_id';
        const { data: transactions } = await supabase
            .from('transactions')
            .select('id')
            .eq(column, groupId);

        if (transactions) {
            const promises = transactions.map(t => this.update(t.id, updates));
            await Promise.all(promises);
        }
    },

    async getFirstTransactionDate() {
        const { data, error } = await supabase
            .from('transactions')
            .select('payment_date')
            .order('payment_date', { ascending: true })
            .limit(1)
            .single();

        if (error) return null;
        return data?.payment_date || null;
    },
};
export type { Transaction };

