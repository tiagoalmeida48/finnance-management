import { z } from 'zod';

export const CategoryTypeSchema = z.enum(['income', 'expense']);

export const CategorySchema = z.object({
  id: z.string(),
  user_id: z.string(),
  name: z.string(),
  type: CategoryTypeSchema,
  icon: z.string(),
  color: z.string(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string().nullable().optional(),
});
