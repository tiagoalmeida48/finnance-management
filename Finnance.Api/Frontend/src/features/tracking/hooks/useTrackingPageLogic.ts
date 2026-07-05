import { useMemo, useState } from 'react';
import { addMonths, eachMonthOfInterval, endOfYear, format, startOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { MonthlyTrackingData, TrackingItemType } from '../types/tracking.types';
import { useTrackingMonthly } from './useTracking';

export function useTrackingPageLogic() {
  const [currentYear, setCurrentYear] = useState(new Date());
  const year = currentYear.getFullYear();

  const { data: monthly, isLoading } = useTrackingMonthly(year);

  const months = useMemo(
    () =>
      eachMonthOfInterval({
        start: startOfYear(currentYear),
        end: endOfYear(currentYear),
      }),
    [currentYear],
  );

  const goToPreviousYear = () => setCurrentYear((prev) => addMonths(prev, -12));
  const goToNextYear = () => setCurrentYear((prev) => addMonths(prev, 12));

  const monthlyData = useMemo<MonthlyTrackingData[]>(() => {
    return months.map((month, index) => {
      const data = (monthly ?? []).find((entry) => entry.month === index + 1);

      return {
        month,
        monthName: format(month, 'MMMM', { locale: ptBR }),
        items: (data?.items ?? []).map((item) => ({
          id: item.id,
          name: item.name,
          total: item.total,
          isPaid: item.isPaid,
          itemType: item.itemType as TrackingItemType,
          account: item.account ?? null,
        })),
        progress: data?.progress ?? 0,
        totalItems: data?.totalItems ?? 0,
        paidItems: data?.paidItems ?? 0,
        totalAmount: data?.totalAmount ?? 0,
      };
    });
  }, [months, monthly]);

  return {
    currentYear,
    goToPreviousYear,
    goToNextYear,
    isLoading,
    monthlyData,
  };
}
