import type { SalarySetting } from './types/salary.types';

export const DEFAULT_INSS_PERCENTAGE = 20;
export const DEFAULT_ADMIN_FEE_PERCENTAGE = 4.5;
export const SALARY_DESCRIPTION_DEFAULT = 'PIX RECEBIDO COOP SOMA';

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
