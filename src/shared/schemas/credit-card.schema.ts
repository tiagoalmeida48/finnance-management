import { z } from 'zod';
import { CreditCardStatementCycleSchema } from './credit-card-statement-cycle.schema';

export const CreditCardSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  name: z.string(),
  credit_limit: z.coerce.number(),
  closing_day: z.coerce.number().optional(),
  due_day: z.coerce.number().optional(),
  bank_account_id: z.string(),
  color: z.string(),
  notes: z.string().nullable().optional(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string().nullable().optional(),
  bank_account: z.object({ name: z.string() }).optional(),
  statement_cycles: z.array(CreditCardStatementCycleSchema).optional(),
  current_statement_cycle: CreditCardStatementCycleSchema.nullable().optional(),
  usage: z.coerce.number().optional(),
  current_invoice: z.coerce.number().optional(),
  available_limit: z.coerce.number().optional(),
});
