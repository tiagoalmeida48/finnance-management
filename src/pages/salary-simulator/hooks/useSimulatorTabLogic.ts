import { useMemo, useState } from "react";
import type { SalarySetting } from "@/shared/interfaces";
import { calculatePayroll } from "@/shared/utils/payroll-calculations";
import {
  buildSettingKey,
  toNumber,
} from "@/pages/salary-simulator/components/salarySimulator.helpers";

export function useSimulatorTabLogic(
  currentSetting: SalarySetting | null | undefined,
  history: SalarySetting[] | undefined,
) {
  const [selectedSettingKey, setSelectedSettingKey] = useState("");
  const [totalHours, setTotalHours] = useState("0");

  const availableSettings = useMemo(() => {
    const allSettings = history ?? [];
    if (allSettings.length > 0) return allSettings;
    return currentSetting ? [currentSetting] : [];
  }, [history, currentSetting]);

  const currentSettingKey = currentSetting
    ? buildSettingKey(currentSetting)
    : "";
  const selectedSettingInputKey =
    selectedSettingKey ||
    currentSettingKey ||
    (availableSettings[0] ? buildSettingKey(availableSettings[0]) : "");

  const selectedSetting = useMemo(() => {
    if (availableSettings.length === 0) return currentSetting ?? null;
    return (
      availableSettings.find(
        (setting) => buildSettingKey(setting) === selectedSettingInputKey,
      ) ??
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

  const currentHourlyRate = Number(calculationSetting?.hourly_rate ?? 0);
  const currentBaseSalary = Number(calculationSetting?.base_salary ?? 0);
  const currentInssPercentage = Number(
    calculationSetting?.inss_discount_percentage ?? 20,
  );
  const currentAdminFeePercentage = Number(
    calculationSetting?.admin_fee_percentage ?? 4.5,
  );

  const payroll = useMemo(
    () =>
      calculatePayroll({
        totalHours: toNumber(totalHours),
        hourlyRate: currentHourlyRate,
        baseSalary: currentBaseSalary,
        inssPercentage: currentInssPercentage,
        adminFeePercentage: currentAdminFeePercentage,
      }),
    [
      totalHours,
      currentHourlyRate,
      currentBaseSalary,
      currentInssPercentage,
      currentAdminFeePercentage,
    ],
  );

  const inssDisplay = Math.abs(payroll.inssDiscount);
  const adminDisplay = Math.abs(payroll.adminFeeDiscount);
  const inssLabel = `${currentInssPercentage.toFixed(2).replace(".", ",")}%`;
  const adminFeeLabel = `${currentAdminFeePercentage.toFixed(2).replace(".", ",")}%`;
  const isNetNegative = payroll.netPay < 0;

  const handleHoursChange = (value: string) => {
    const normalizedValue = value.replace(",", ".");
    const valueWithoutLeadingZeros = normalizedValue.startsWith("0.")
      ? normalizedValue
      : normalizedValue.replace(/^0+(?=\d)/, "");

    if (
      valueWithoutLeadingZeros === "" ||
      /^\d+(\.\d{0,1})?$/.test(valueWithoutLeadingZeros)
    ) {
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
