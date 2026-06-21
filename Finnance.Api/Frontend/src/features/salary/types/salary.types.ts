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

export interface SalarySimulationInput {
  baseSalary: number;
  hourlyRate: number;
  extraHours: number;
  inssDiscountPercentage: number;
  adminFeePercentage: number;
}

export interface SalarySimulationResult {
  gross: number;
  inss: number;
  adminFee: number;
  net: number;
}
