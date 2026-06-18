import { z } from 'zod';
import { SalarySettingSchema } from '@/shared/schemas';

export type SalarySetting = z.infer<typeof SalarySettingSchema>;

export interface CreateSalarySettingInput {
  date_start: string;
  hourly_rate: number;
  base_salary: number;
  inss_discount_percentage: number;
  admin_fee_percentage: number;
}

export interface UpdateSalarySettingInput {
  original_date_start: string;
  original_date_end: string;
  date_start: string;
  date_end: string;
  hourly_rate: number;
  base_salary: number;
  inss_discount_percentage: number;
  admin_fee_percentage: number;
}
