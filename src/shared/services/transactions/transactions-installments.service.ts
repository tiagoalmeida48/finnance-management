import { supabase } from '@/lib/supabase/client';
import type { Transaction } from '../../interfaces';
import { filterGroupUpdates } from '@/shared/utils/transactionsGroup.utils';
import { transactionsCoreService } from './transactions-core.service';

export const transactionsInstallmentsService = {
  async deleteGroup(groupId: string, type: 'installment' | 'recurring') {
    const { error } = await supabase.rpc('delete_transaction_group', {
      p_group_id: groupId,
      p_type: type,
    });

    if (error) throw error;
  },

  async insertInstallmentBetween(id: string) {
    const { data, error } = await supabase.rpc('insert_installment_between', {
      p_transaction_id: id,
    });

    if (error) throw error;

    const newTransactionId = data as string;
    return await transactionsCoreService.getById(newTransactionId);
  },

  async updateGroup(
    groupId: string,
    type: 'installment' | 'recurring',
    updates: Partial<Transaction>,
  ) {
    const groupUpdates = filterGroupUpdates(updates);
    if (Object.keys(groupUpdates).length === 0) return [];

    const { error } = await supabase.rpc('update_transaction_group', {
      p_group_id: groupId,
      p_type: type,
      p_updates: groupUpdates as Record<string, unknown>,
    });

    if (error) throw error;

    const column = type === 'installment' ? 'installment_group_id' : 'recurring_group_id';
    const transactions = await transactionsCoreService.getAll();
    return transactions.filter((transaction) => transaction[column] === groupId);
  },
};

