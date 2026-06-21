import { useMemo, useState } from 'react';
import { CategoryTypeId } from '@/config/constants';
import { useAccounts } from '@/features/accounts';
import { useCategories } from '@/features/categories';
import { usePaymentMethodsLookup } from '@/features/transactions/hooks/useLookups';
import { useCurrentSalary, useSalaryHistory } from './useSalary';
import { useSimulatorTab } from './useSimulatorTab';
import { useSettingsTab } from './useSettingsTab';
import { useLaunchSalary } from './useLaunchSalary';

export type SalaryTab = 'simulator' | 'settings';

export function useSalarySimulatorPageLogic() {
  const [activeTab, setActiveTab] = useState<SalaryTab>('simulator');

  const accountsQuery = useAccounts();
  const categoriesQuery = useCategories();
  const paymentMethodsQuery = usePaymentMethodsLookup();
  const currentQuery = useCurrentSalary();
  const historyQuery = useSalaryHistory();

  const accounts = useMemo(() => accountsQuery.data ?? [], [accountsQuery.data]);
  const incomeCategories = useMemo(
    () => (categoriesQuery.data ?? []).filter((category) => category.categoryType === CategoryTypeId.INCOME),
    [categoriesQuery.data],
  );

  const debitPaymentMethodId = useMemo(() => {
    const methods = paymentMethodsQuery.data ?? [];
    const debit = methods.find((method) => method.name.toLowerCase().includes('débito') || method.name.toLowerCase().includes('debito'));
    return debit ? debit.paymentMethod : (methods[0]?.paymentMethod ?? null);
  }, [paymentMethodsQuery.data]);

  const simulator = useSimulatorTab(currentQuery.data, historyQuery.data);
  const settings = useSettingsTab();
  const launch = useLaunchSalary(accounts, incomeCategories, simulator.payroll.netPay, debitPaymentMethodId);

  return {
    activeTab,
    setActiveTab,
    accounts,
    incomeCategories,
    currentSetting: currentQuery.data ?? null,
    history: historyQuery.data ?? [],
    loadingCurrent: currentQuery.isLoading,
    loadingHistory: historyQuery.isLoading,
    ...simulator,
    ...settings,
    ...launch,
  };
}
