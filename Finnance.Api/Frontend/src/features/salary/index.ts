export * from './types/salary.types';
export * from './services/salaryService';
export * from './hooks/useSalary';
export { useSalarySimulatorPageLogic } from './hooks/useSalarySimulatorPageLogic';
export type { SalaryTab } from './hooks/useSalarySimulatorPageLogic';
export {
  calculatePayroll,
  formatValidity,
  formatDateBR,
  formatPercentLabel,
  buildSettingKey,
} from './constants';
export { SalarySettingFormModal } from './components/SalarySettingFormModal';
export type { SalaryFormValues } from './components/SalarySettingFormModal';
export { SalarySimulatorPanel, SalarySimulatorSummary } from './components/SalarySimulatorTab';
export { SalarySettingsTab } from './components/SalarySettingsTab';
export { PayrollCalculatorTab } from './components/PayrollCalculatorTab';
export { SalaryEditSettingDialog } from './components/SalaryEditSettingDialog';
export { SalaryCloseDialog } from './components/SalaryCloseDialog';
export { SalaryLaunchDialog } from './components/SalaryLaunchDialog';
