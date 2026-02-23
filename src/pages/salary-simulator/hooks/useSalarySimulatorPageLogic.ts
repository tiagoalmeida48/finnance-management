import { format } from "date-fns";
import { useMemo, useState } from "react";
import { useAccounts } from "@/shared/hooks/api/useAccounts";
import { useCategories } from "@/shared/hooks/api/useCategories";
import {
  useSalaryCurrentSetting,
  useSalarySettingsHistory,
} from "@/shared/hooks/api/useSalarySettings";

import { useSimulatorTabLogic } from "./useSimulatorTabLogic";
import { useSettingsTabLogic } from "./useSettingsTabLogic";
import { useLaunchSalaryLogic } from "./useLaunchSalaryLogic";

type MessageState = { type: "success" | "error"; text: string } | null;
type ActiveTab = "simulator" | "settings";

export function useSalarySimulatorPageLogic() {
  const today = format(new Date(), "yyyy-MM-dd");
  const [message, setMessage] = useState<MessageState>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("simulator");

  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const { data: currentSetting, isLoading: loadingCurrent } =
    useSalaryCurrentSetting();
  const { data: history, isLoading: loadingHistory } =
    useSalarySettingsHistory();

  const incomeCategories = useMemo(
    () => categories.filter((category) => category.type === "income"),
    [categories],
  );

  const simulatorLogic = useSimulatorTabLogic(currentSetting, history);

  const settingsLogic = useSettingsTabLogic(
    setMessage,
    simulatorLogic.selectedSettingKey,
    simulatorLogic.setSelectedSettingKey,
  );

  const launchLogic = useLaunchSalaryLogic(
    accounts,
    incomeCategories,
    simulatorLogic.payroll.netPay,
    setMessage,
  );

  return {
    today,
    message,
    activeTab,
    setActiveTab,
    loadingCurrent,
    loadingHistory,
    currentSetting,
    history,
    accounts,
    incomeCategories,

    ...simulatorLogic,
    ...settingsLogic,
    ...launchLogic,
  };
}
