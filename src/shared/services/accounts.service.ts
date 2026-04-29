import { z } from 'zod';
import { supabase } from '@/lib/supabase/client';
import { Account } from '../interfaces';
import { AccountSchema } from '../schemas';

export const accountsService = {
  async getAll() {
<<<<<<< HEAD
    const { data, error } = await supabase.rpc('get_accounts');
=======
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .is('deleted_at', null)
      .order('name');

>>>>>>> finnance-management/main
    if (error) throw error;
    return z.array(AccountSchema).parse(data);
  },

  async create(account: Omit<Account, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
<<<<<<< HEAD
    const { data, error } = await supabase.rpc('create_account', {
      p_name: account.name,
      p_type: account.type,
      p_initial_balance: account.initial_balance,
      p_color: account.color ?? null,
      p_icon: account.icon ?? null,
      p_pluggy_account_id: account.pluggy_account_id ?? null,
    });
=======
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

>>>>>>> finnance-management/main
    if (error) throw error;
    return AccountSchema.parse(data);
  },

  async update(id: string, updates: Partial<Omit<Account, 'id' | 'user_id' | 'created_at'>>) {
<<<<<<< HEAD
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
=======
    const { data, error } = await supabase
      .from('bank_accounts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

>>>>>>> finnance-management/main
    if (error) throw error;
    return AccountSchema.parse(data);
  },

  async delete(id: string) {
<<<<<<< HEAD
    const { error } = await supabase.rpc('delete_account', { p_id: id });
=======
    const { error } = await supabase
      .from('bank_accounts')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

>>>>>>> finnance-management/main
    if (error) throw error;
  },

  async adjustBalance(id: string, delta: number) {
<<<<<<< HEAD
    const { error } = await supabase.rpc('increment_account_balance', {
      p_account_id: id,
      p_amount: delta,
    });
    if (error) throw error;
=======
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
>>>>>>> finnance-management/main
  },
};
