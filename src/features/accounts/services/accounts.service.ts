import { supabase } from '@/lib/supabase/client';

export type AccountType = 'checking' | 'savings' | 'investment' | 'wallet' | 'other';

export interface Account {
    id: string;
    user_id: string;
    name: string;
    type: AccountType;
    initial_balance: number;
    current_balance: number;
    color: string;
    icon: string;
    notes?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}

export const accountsService = {
    async getAll() {
        const { data, error } = await supabase
            .from('bank_accounts')
            .select('*')
            .is('deleted_at', null)
            .order('name');

        if (error) throw error;
        return data as Account[];
    },

    async create(account: Omit<Account, 'id' | 'user_id' | 'created_at'>) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('bank_accounts')
            .insert({
                ...account,
                user_id: user.id,
                current_balance: account.initial_balance // Ensure balance starts with initial value
            })
            .select()
            .single();

        if (error) throw error;
        return data as Account;
    },

    async update(id: string, updates: Partial<Omit<Account, 'id' | 'user_id' | 'created_at'>>) {
        const { data, error } = await supabase
            .from('bank_accounts')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Account;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('bank_accounts')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    },

    async adjustBalance(id: string, delta: number) {
        // Read current balance
        const { data: account, error: fetchError } = await supabase
            .from('bank_accounts')
            .select('current_balance')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;
        if (!account) throw new Error('Account not found');

        // Update with new balance
        const newBalance = (Number(account.current_balance) || 0) + delta;
        const { error: updateError } = await supabase
            .from('bank_accounts')
            .update({ current_balance: newBalance, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (updateError) throw updateError;
    }
};
