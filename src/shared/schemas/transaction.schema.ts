import { z } from 'zod';

export const TransactionTypeSchema = z.enum(['income', 'expense', 'transfer']);

const RelationNameSchema = z.object({ name: z.string() }).optional();

const CategoryRelationSchema = z
  .object({ name: z.string(), color: z.string(), icon: z.string() })
  .optional();

const CreditCardRelationSchema = z
  .object({ name: z.string(), color: z.string().optional() })
  .optional();

export const TransactionSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  type: TransactionTypeSchema,
  amount: z.coerce.number(),
  description: z.string(),
  payment_date: z.string(),
  purchase_date: z.string().nullable().optional(),
  account_id: z.string().nullable().optional(),
  to_account_id: z.string().nullable().optional(),
  card_id: z.string().nullable().optional(),
  invoice_id: z.string().nullable().optional(),
  category_id: z.string().nullable().optional(),
  is_fixed: z.boolean(),
  is_paid: z.boolean(),
  installment_group_id: z.string().nullable().optional(),
  installment_number: z.coerce.number().nullable().optional(),
  total_installments: z.coerce.number().nullable().optional(),
  recurring_group_id: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  payment_method: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  bank_account: RelationNameSchema,
  to_bank_account: RelationNameSchema,
  category: CategoryRelationSchema,
  credit_card: CreditCardRelationSchema,
});
