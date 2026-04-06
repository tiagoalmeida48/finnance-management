import { z } from 'zod';

export const TransactionTypeSchema = z.enum(['income', 'expense', 'transfer']);

const RelationNameSchema = z.object({ name: z.string() }).nullish();

const CategoryRelationSchema = z
  .object({ name: z.string(), color: z.string(), icon: z.string() })
  .nullish();

const CreditCardRelationSchema = z
  .object({ name: z.string(), color: z.string().nullish() })
  .nullish();

export const TransactionSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  type: TransactionTypeSchema,
  amount: z.coerce.number(),
  description: z.string(),
  payment_date: z.string().nullable(),
  purchase_date: z.string().nullish(),
  account_id: z.string().nullish(),
  to_account_id: z.string().nullish(),
  card_id: z.string().nullish(),
  invoice_id: z.string().nullish(),
  category_id: z.string().nullish(),
  is_fixed: z.boolean(),
  is_paid: z.boolean(),
  installment_group_id: z.string().nullish(),
  installment_number: z.coerce.number().nullish(),
  total_installments: z.coerce.number().nullish(),
  recurring_group_id: z.string().nullish(),
  notes: z.string().nullish(),
  payment_method: z.string().nullish(),
  created_at: z.string(),
  updated_at: z.string(),
  bank_account: RelationNameSchema,
  to_bank_account: RelationNameSchema,
  category: CategoryRelationSchema,
  credit_card: CreditCardRelationSchema,
});

