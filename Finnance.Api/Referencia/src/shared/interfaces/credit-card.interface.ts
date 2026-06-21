import { z } from 'zod';
import { CreditCardSchema } from '@/shared/schemas';

export type CreditCard = z.infer<typeof CreditCardSchema>;

export type CreateCreditCardInput = Omit<
  CreditCard,
  | 'id'
  | 'user_id'
  | 'created_at'
  | 'updated_at'
  | 'deleted_at'
  | 'bank_account'
  | 'statement_cycles'
  | 'current_statement_cycle'
  | 'usage'
  | 'current_invoice'
  | 'available_limit'
>;

export type UpdateCreditCardInput = Partial<Omit<CreateCreditCardInput, 'closing_day' | 'due_day'>>;
