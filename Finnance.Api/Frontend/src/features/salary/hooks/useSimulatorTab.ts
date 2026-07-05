import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/shared/hooks';
import { salaryService } from '../services/salaryService';
import {
  buildSettingKey,
  DEFAULT_ADMIN_FEE_PERCENTAGE,
  DEFAULT_INSS_PERCENTAGE,
  formatPercentLabel,
  toNumber,
} from '../constants';
import type { PayrollResult, SalarySetting } from '../types/salary.types';

const ZERO_PAYROLL: PayrollResult = {
  grossPay: 0,
  baseSalary: 0,
  profitAdvance: 0,
  inssDiscount: 0,
  adminFeeDiscount: 0,
  totalDiscounts: 0,
  netPay: 0,
};

export function useSimulatorTab(
  currentSetting: SalarySetting | null | undefined,
  history: SalarySetting[] | undefined,
) {
  const [selectedSettingKey, setSelectedSettingKey] = useState('');
  const [totalHours, setTotalHours] = useState('0');

  const availableSettings = useMemo(() => {
    const allSettings = history ?? [];
    if (allSettings.length > 0) return allSettings;
    return currentSetting ? [currentSetting] : [];
  }, [history, currentSetting]);

  const currentSettingKey = currentSetting ? buildSettingKey(currentSetting) : '';
  const selectedSettingInputKey =
    selectedSettingKey ||
    currentSettingKey ||
    (availableSettings[0] ? buildSettingKey(availableSettings[0]) : '');

  const selectedSetting = useMemo(() => {
    if (availableSettings.length === 0) return currentSetting ?? null;
    return (
      availableSettings.find((setting) => buildSettingKey(setting) === selectedSettingInputKey) ??
      currentSetting ??
      availableSettings[0]
    );
  }, [availableSettings, currentSetting, selectedSettingInputKey]);

  const calculationSetting = selectedSetting ?? currentSetting ?? null;
  const isTemporaryCalculation = Boolean(
    calculationSetting &&
      currentSetting &&
      buildSettingKey(calculationSetting) !== buildSettingKey(currentSetting),
  );

  const currentHourlyRate = Number(calculationSetting?.hourlyRate ?? 0);
  const currentBaseSalary = Number(calculationSetting?.baseSalary ?? 0);
  const currentInssPercentage = Number(
    calculationSetting?.inssDiscountPercentage ?? DEFAULT_INSS_PERCENTAGE,
  );
  const currentAdminFeePercentage = Number(
    calculationSetting?.adminFeePercentage ?? DEFAULT_ADMIN_FEE_PERCENTAGE,
  );

  const hoursValue = Math.max(0, toNumber(totalHours));
  const debouncedHours = useDebounce(hoursValue, 300);
  const settingId = calculationSetting?.settingsSalary ?? null;

  const payrollQuery = useQuery({
    queryKey: ['salary', 'payroll', settingId ?? 0, debouncedHours],
    queryFn: () =>
      salaryService.calculatePayroll({ totalHours: debouncedHours, settingsSalary: settingId }),
    enabled: settingId != null && debouncedHours > 0,
    placeholderData: (previous: PayrollResult | undefined) => previous,
  });

  const payroll = debouncedHours > 0 ? (payrollQuery.data ?? ZERO_PAYROLL) : ZERO_PAYROLL;

  const inssDisplay = Math.abs(payroll.inssDiscount);
  const adminDisplay = Math.abs(payroll.adminFeeDiscount);
  const inssLabel = formatPercentLabel(currentInssPercentage);
  const adminFeeLabel = formatPercentLabel(currentAdminFeePercentage);
  const isNetNegative = payroll.netPay < 0;

  const handleHoursChange = (value: string) => {
    const normalizedValue = value.replace(',', '.');
    const valueWithoutLeadingZeros = normalizedValue.startsWith('0.')
      ? normalizedValue
      : normalizedValue.replace(/^0+(?=\d)/, '');

    if (valueWithoutLeadingZeros === '' || /^\d+(\.\d{0,1})?$/.test(valueWithoutLeadingZeros)) {
      setTotalHours(valueWithoutLeadingZeros);
    }
  };

  const handleHoursBlur = () => {
    const normalizedHours = Math.max(0, Number(totalHours) || 0);
    setTotalHours(normalizedHours.toFixed(1));
  };

  return {
    selectedSettingKey,
    selectedSettingInputKey,
    totalHours,
    availableSettings,
    calculationSetting,
    isTemporaryCalculation,
    currentHourlyRate,
    currentBaseSalary,
    inssLabel,
    adminFeeLabel,
    inssDisplay,
    adminDisplay,
    payroll,
    isNetNegative,
    setSelectedSettingKey,
    handleHoursChange,
    handleHoursBlur,
  };
}
