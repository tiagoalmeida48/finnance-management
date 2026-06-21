import { z } from 'zod';
import { CreditCardStatementCycleSchema } from '@/shared/schemas';

export type CreditCardStatementCycle = z.infer<typeof CreditCardStatementCycleSchema>;

export interface CreateCreditCardStatementCycleInput {
  card_id: string;
  date_start: string;
  closing_day: number;
  due_day: number;
  notes?: string;
}

export interface UpdateCreditCardStatementCycleInput {
  closing_day: number;
  due_day: number;
  notes?: string;
}
