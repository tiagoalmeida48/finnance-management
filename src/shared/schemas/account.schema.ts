import { z } from 'zod';

export const AccountTypeSchema = z.enum(['checking', 'savings', 'investment', 'wallet', 'other']);

export const AccountSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  name: z.string(),
  type: AccountTypeSchema,
  initial_balance: z.coerce.number(),
  current_balance: z.coerce.number(),
<<<<<<< HEAD
  color: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
=======
  color: z.string(),
  icon: z.string(),
  notes: z.string().optional(),
>>>>>>> finnance-management/main
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string().nullable().optional(),
<<<<<<< HEAD
  pluggy_account_id: z.string().nullable().optional(),
=======
>>>>>>> finnance-management/main
});
