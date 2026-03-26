import { z } from 'zod';

export const CreditCardStatementCycleSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  card_id: z.string(),
  date_start: z.string(),
  date_end: z.string(),
  closing_day: z.coerce.number(),
  due_day: z.coerce.number(),
  notes: z.string().nullable().optional(),
  created_at: z.string(),
});
