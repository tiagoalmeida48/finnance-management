import { z } from 'zod';
import { TransactionSchema, TransactionTypeSchema } from '@/shared/schemas';

export type TransactionType = z.infer<typeof TransactionTypeSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;

export interface CreateTransactionData extends Omit<
  Transaction,
  | 'id'
  | 'user_id'
  | 'created_at'
  | 'updated_at'
  | 'bank_account'
  | 'to_bank_account'
  | 'category'
  | 'credit_card'
> {
  installment_amounts?: number[];
  repeat_count?: number;
  is_installment?: boolean;
}
