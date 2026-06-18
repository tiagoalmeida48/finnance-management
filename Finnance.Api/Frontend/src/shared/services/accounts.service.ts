import { z } from 'zod';
import { supabase } from '@/lib/supabase/client';
import { Account } from '../interfaces';
import { AccountSchema } from '../schemas';

export const accountsService = {
  async getAll() {
    const { data, error } = await supabase.rpc('get_accounts');
    if (error) throw error;
    return z.array(AccountSchema).parse(data);
  },

  async create(account: Omit<Account, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase.rpc('create_account', {
      p_name: account.name,
      p_type: account.type,
      p_initial_balance: account.initial_balance,
      p_color: account.color ?? null,
      p_icon: account.icon ?? null,
      p_pluggy_account_id: account.pluggy_account_id ?? null,
    });
    if (error) throw error;
    return AccountSchema.parse(data);
  },

  async update(id: string, updates: Partial<Omit<Account, 'id' | 'user_id' | 'created_at'>>) {
    const { data, error } = await supabase.rpc('update_account', {
      p_id: id,
      p_name: updates.name ?? null,
      p_type: updates.type ?? null,
      p_color: updates.color ?? null,
      p_icon: updates.icon ?? null,
      p_pluggy_account_id: updates.pluggy_account_id ?? null,
      p_initial_balance: updates.initial_balance ?? null,
      p_current_balance: updates.current_balance ?? null,
      p_is_active: updates.is_active ?? null,
    });
    if (error) throw error;
    return AccountSchema.parse(data);
  },

  async delete(id: string) {
    const { error } = await supabase.rpc('delete_account', { p_id: id });
    if (error) throw error;
  },

  async adjustBalance(id: string, delta: number) {
    const { error } = await supabase.rpc('increment_account_balance', {
      p_account_id: id,
      p_amount: delta,
    });
    if (error) throw error;
  },
};
