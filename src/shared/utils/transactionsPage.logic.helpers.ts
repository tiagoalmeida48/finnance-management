import type { Transaction } from "../services/transactions.service";
import type { TransactionGroup } from "./transactionsPage.utils";

export const clearContextMenuState = (
  setAnchorEl: (value: null) => void,
  setMenuTransaction: (value: null) => void,
) => {
  setAnchorEl(null);
  setMenuTransaction(null);
};

export const mergeUniqueIds = (baseIds: string[], nextIds: string[]) =>
  Array.from(new Set([...baseIds, ...nextIds]));

export const removeIds = (baseIds: string[], idsToRemove: string[]) => {
  const idsToRemoveSet = new Set(idsToRemove);
  return baseIds.filter((id) => !idsToRemoveSet.has(id));
};

export const extractGroupOrTransactionIds = (
  rows: Array<Transaction | TransactionGroup>,
) =>
  rows.flatMap((item) =>
    "isGroup" in item && item.isGroup
      ? item.items.map((transaction) => transaction.id)
      : [item.id],
  );
