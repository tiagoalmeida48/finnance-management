import { z } from 'zod';
import { AccountSchema, AccountTypeSchema } from '@/shared/schemas';

export type AccountType = z.infer<typeof AccountTypeSchema>;
export type Account = z.infer<typeof AccountSchema>;
