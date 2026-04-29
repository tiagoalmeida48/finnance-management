import { useState } from 'react';
import type { TransactionSortConfig, TransactionSortField } from '@/shared/utils/transactionsPage.utils';

export function useTransactionFilters() {
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [showAllTime, setShowAllTime] = useState(false);
  const [hideCreditCards, setHideCreditCards] = useState(false);
  const [showOnlyCardPurchases, setShowOnlyCardPurchases] = useState(false);
  const [showInstallmentsOnly, setShowInstallmentsOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [cardFilter, setCardFilter] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<TransactionSortConfig>({
    field: 'payment_date',
    direction: 'desc',
  });

  const handleSetShowAllTime = (value: boolean) => {
    setShowAllTime(value);
    if (!value) setShowInstallmentsOnly(false);
  };

  const handleSetHideCreditCards = (value: boolean) => {
    setHideCreditCards(value);
    if (value) setShowOnlyCardPurchases(false);
  };

  const handleSetShowOnlyCardPurchases = (value: boolean) => {
    setShowOnlyCardPurchases(value);
    if (value) setHideCreditCards(false);
  };

  const handleSetShowInstallmentsOnly = (value: boolean) => {
    setShowInstallmentsOnly(value);
    if (value) setShowAllTime(true);
  };

  const handleSort = (field: TransactionSortField) => {
    setSortConfig((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const shouldUseAllTimeRange = showAllTime || showInstallmentsOnly;

  return {
    typeFilter,
    setTypeFilter,
    currentMonth,
    setCurrentMonth,
    showPendingOnly,
    setShowPendingOnly,
    showAllTime,
    setShowAllTime: handleSetShowAllTime,
    hideCreditCards,
    setHideCreditCards: handleSetHideCreditCards,
    showOnlyCardPurchases,
    setShowOnlyCardPurchases: handleSetShowOnlyCardPurchases,
    showInstallmentsOnly,
    setShowInstallmentsOnly: handleSetShowInstallmentsOnly,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    paymentMethodFilter,
    setPaymentMethodFilter,
    accountFilter,
    setAccountFilter,
    cardFilter,
    setCardFilter,
    sortConfig,
    setSortConfig,
    handleSort,
    shouldUseAllTimeRange,
  };
}
