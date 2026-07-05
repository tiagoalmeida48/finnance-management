export interface SalarySetting {
  settingsSalary: number;
  dateStart: string;
  dateEnd: string;
  hourlyRate: number;
  baseSalary: number;
  inssDiscountPercentage: number;
  adminFeePercentage: number;
  active: boolean;
  created: string;
  updated: string;
}

export interface SalarySettingCreateInput {
  dateStart: string;
  hourlyRate: number;
  baseSalary: number;
  inssDiscountPercentage: number;
  adminFeePercentage: number;
}

export interface SalarySettingUpdateInput {
  settingsSalary: number;
  dateStart: string;
  dateEnd: string;
  hourlyRate: number;
  baseSalary: number;
  inssDiscountPercentage: number;
  adminFeePercentage: number;
}

export interface SalarySettingCloseInput {
  settingsSalary: number;
  dateEnd: string;
}

export interface PayrollCalculateInput {
  totalHours: number;
  settingsSalary: number | null;
}

export interface PayrollResult {
  grossPay: number;
  baseSalary: number;
  profitAdvance: number;
  inssDiscount: number;
  adminFeeDiscount: number;
  totalDiscounts: number;
  netPay: number;
}

export interface EditSettingForm {
  settingsSalary: number;
  dateStart: string;
  dateEnd: string;
  active: boolean;
  hourlyRate: string;
  baseSalary: string;
  inssPercentage: string;
  adminFeePercentage: string;
}
