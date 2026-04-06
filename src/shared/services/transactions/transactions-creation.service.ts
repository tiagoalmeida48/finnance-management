import { supabase } from '@/lib/supabase/client';
import type { CreateTransactionData } from '../../interfaces';
import {
  stripInstallmentSuffix,
  toDateKeyIgnoringTime,
} from '@/shared/utils/transactionsGroup.utils';
import { transactionsCoreService } from './transactions-core.service';
import {
  buildSingleTransactionCreatePayload,
  requireAuthenticatedUserId,
} from './transactions-utils.service';

export const transactionsCreationService = {
  async create(transaction: CreateTransactionData) {
    const { data, error } = await supabase.rpc('create_transaction', {
      p_data: transaction as Record<string, unknown>,
    });

    if (error) throw error;

    const result = data as { id: string; group_id: string | null };
    return await transactionsCoreService.getById(result.id);
  },

  async duplicate(id: string) {
    const transaction = await transactionsCoreService.getById(id);
    const baseDescription =
      stripInstallmentSuffix(transaction.description) || transaction.description;

    const duplicatePayload = buildSingleTransactionCreatePayload(transaction, {
      description: `${baseDescription} (copia)`,
      payment_date: toDateKeyIgnoringTime(transaction.payment_date) ?? transaction.payment_date,
      purchase_date:
        toDateKeyIgnoringTime(transaction.purchase_date ?? undefined) ??
        transaction.purchase_date ??
        undefined,
    });

    return await this.create(duplicatePayload);
  },
};

export { requireAuthenticatedUserId };
