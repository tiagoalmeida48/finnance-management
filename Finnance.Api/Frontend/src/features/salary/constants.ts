import type { PayrollInput, PayrollResult, SalarySetting } from './types/salary.types';

export const DEFAULT_TETO_INSS = 1167.89;
export const DEFAULT_INSS_PERCENTAGE = 20;
export const DEFAULT_ADMIN_FEE_PERCENTAGE = 4.5;
export const SALARY_DESCRIPTION_DEFAULT = 'PIX RECEBIDO COOP SOMA';

const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export const calculatePayroll = (input: PayrollInput): PayrollResult => {
  const totalHours = Math.max(0, Number(input.totalHours) || 0);
  const hourlyRate = Math.max(0, Number(input.hourlyRate) || 0);
  const baseSalary = Math.max(0, Number(input.baseSalary) || 0);
  const inssPercentage = Math.max(0, Number(input.inssPercentage) || 0);
  const adminFeePercentage = Math.max(0, Number(input.adminFeePercentage) || 0);
  const tetoInss = input.tetoInss ?? DEFAULT_TETO_INSS;

  const grossPay = round2(totalHours * hourlyRate);
  const profitAdvance = grossPay > 0 ? round2(grossPay - baseSalary) : 0;

  const inssDiscount =
    grossPay > 0 ? round2(-Math.min(baseSalary * (inssPercentage / 100), tetoInss)) : 0;

  const adminFeeDiscount = grossPay > 0 ? round2(-(grossPay * (adminFeePercentage / 100))) : 0;

  const totalDiscounts = round2(inssDiscount + adminFeeDiscount);
  const netPay = round2(grossPay + totalDiscounts);

  return {
    grossPay,
    baseSalary,
    profitAdvance,
    inssDiscount,
    adminFeeDiscount,
    totalDiscounts,
    netPay,
  };
};

export const toNumber = (value: string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const buildSettingKey = (setting: SalarySetting): string =>
  `${setting.settingsSalary}`;

export const formatValidity = (setting: SalarySetting): string => {
  const start = formatDateBR(setting.dateStart);
  const end = setting.active ? 'Vigente' : formatDateBR(setting.dateEnd);
  return `${start} até ${end}`;
};

export const formatDateBR = (value: string): string => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('pt-BR');
};

export const formatPercentLabel = (value: number): string =>
  `${value.toFixed(2).replace('.', ',')}%`;
