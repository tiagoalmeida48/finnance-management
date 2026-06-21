import { z } from 'zod';

export const SalarySettingSchema = z.object({
  user_id: z.string(),
  date_start: z.string(),
  date_end: z.string(),
  hourly_rate: z.coerce.number(),
  base_salary: z.coerce.number(),
  inss_discount_percentage: z.coerce.number(),
  admin_fee_percentage: z.coerce.number(),
});
