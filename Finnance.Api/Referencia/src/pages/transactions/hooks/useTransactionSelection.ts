import { useState } from 'react';
import type { Transaction } from '@/shared/interfaces';
import {
  clearContextMenuState,
  extractGroupOrTransactionIds,
  mergeUniqueIds,
  removeIds,
} from '@/shared/utils/transactionsPage.helpers';
import type { TransactionGroup } from '@/shared/utils/transactionsPage.utils';

export function useTransactionSelection() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuTransaction, setMenuTransaction] = useState<Transaction | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, transaction: Transaction) => {
    setAnchorEl(event.currentTarget);
    setMenuTransaction(transaction);
  };

  const handleCloseMenu = () => {
    clearContextMenuState(setAnchorEl, setMenuTransaction);
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleSelectAll = (
    checked: boolean,
    currentPageRows: Array<Transaction | TransactionGroup>,
  ) => {
    const currentPageIds = extractGroupOrTransactionIds(currentPageRows);
    if (!checked) {
      setSelectedIds((prev) => removeIds(prev, currentPageIds));
      return;
    }
    setSelectedIds((prev) => mergeUniqueIds(prev, currentPageIds));
  };

  const clearMenuState = () => {
    clearContextMenuState(setAnchorEl, setMenuTransaction);
  };

  return {
    selectedIds,
    setSelectedIds,
    anchorEl,
    setAnchorEl,
    menuTransaction,
    setMenuTransaction,
    handleOpenMenu,
    handleCloseMenu,
    handleSelectRow,
    handleSelectAll,
    clearMenuState,
  };
}
