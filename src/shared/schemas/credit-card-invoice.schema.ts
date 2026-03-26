import { z } from 'zod';

export const InvoiceStatusSchema = z.enum(['open', 'closed', 'partial', 'paid', 'overdue']);

export const CreditCardInvoiceSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  card_id: z.string(),
  month_key: z.string(),
  closing_date: z.string(),
  due_date: z.string(),
  total_amount: z.coerce.number(),
  paid_amount: z.coerce.number(),
  status: InvoiceStatusSchema,
  closed_at: z.string().nullable(),
  paid_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});
