import { z } from 'zod';
import { supabase } from '@/lib/supabase/client';
import { Account } from '../interfaces';
import { AccountSchema } from '../schemas';

export const accountsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .is('deleted_at', null)
      .order('name');

    if (error) throw error;
    return z.array(AccountSchema).parse(data);
  },

  async create(account: Omit<Account, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('bank_accounts')
      .insert({
        ...account,
        user_id: user.id,
        current_balance: account.initial_balance,
      })
      .select()
      .single();

    if (error) throw error;
    return AccountSchema.parse(data);
  },

  async update(id: string, updates: Partial<Omit<Account, 'id' | 'user_id' | 'created_at'>>) {
    const { data, error } = await supabase
      .from('bank_accounts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return AccountSchema.parse(data);
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('bank_accounts')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  },

  async adjustBalance(id: string, delta: number) {
    const { data: account, error: fetchError } = await supabase
      .from('bank_accounts')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    if (!account) throw new Error('Account not found');

    const { error: updateError } = await supabase.rpc('increment_account_balance', {
      p_account_id: id,
      p_amount: delta,
    });

    if (updateError) throw updateError;
  },
};
