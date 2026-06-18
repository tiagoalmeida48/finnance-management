import { z } from 'zod';
import { CategorySchema, CategoryTypeSchema } from '@/shared/schemas';

export type CategoryType = z.infer<typeof CategoryTypeSchema>;
export type Category = z.infer<typeof CategorySchema>;
