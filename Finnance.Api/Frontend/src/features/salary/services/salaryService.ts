import { apiClient } from '@/config/http';
import type {
  SalarySetting,
  SalarySettingCloseInput,
  SalarySettingCreateInput,
  SalarySettingUpdateInput,
  SalarySimulationInput,
  SalarySimulationResult,
} from '../types/salary.types';

export const salaryService = {
  history: async (): Promise<SalarySetting[]> => {
    return apiClient.get<SalarySetting[]>('/settings-salary/history');
  },

  current: async (): Promise<SalarySetting | null> => {
    return apiClient.get<SalarySetting | null>('/settings-salary/current');
  },

  open: async (): Promise<SalarySetting | null> => {
    return apiClient.get<SalarySetting | null>('/settings-salary/open');
  },

  create: async (input: SalarySettingCreateInput): Promise<number> => {
    return apiClient.post<number>('/settings-salary/create', input);
  },

  update: async (input: SalarySettingUpdateInput): Promise<boolean> => {
    return apiClient.put<boolean>('/settings-salary/update', input);
  },

  close: async (input: SalarySettingCloseInput): Promise<boolean> => {
    return apiClient.put<boolean>('/settings-salary/close', {
      settingsSalary: input.settingsSalary,
      dateEnd: input.dateEnd,
    });
  },

  simulate: async (input: SalarySimulationInput): Promise<SalarySimulationResult> => {
    return apiClient.post<SalarySimulationResult>('/settings-salary/simulate', input);
  },
};
