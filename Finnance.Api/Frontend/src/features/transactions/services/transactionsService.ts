import { apiClient } from '@/config/http';
import type {
  BatchChangeDayInput,
  BatchPayInput,
  CreateResult,
  DeleteGroupInput,
  Transaction,
  TransactionCreateInput,
  TransactionFilter,
  TransactionListResult,
  TransactionSummary,
  TransactionUpdateInput,
  UpdateGroupInput,
} from '../types/transactions.types';

export const transactionsService = {
  list: async (filter: TransactionFilter): Promise<Transaction[]> => {
    return apiClient.post<Transaction[]>('/transaction/list', filter);
  },

  listGrouped: async (filter: TransactionFilter): Promise<TransactionListResult> => {
    return apiClient.post<TransactionListResult>('/transaction/list-grouped', filter);
  },

  recent: async (quantity = 10): Promise<Transaction[]> => {
    return apiClient.get<Transaction[]>('/transaction/recent', { quantity });
  },

  getById: async (transaction: number): Promise<Transaction> => {
    return apiClient.get<Transaction>('/transaction/get-by-id', { transaction });
  },

  summary: async (filter: TransactionFilter): Promise<TransactionSummary> => {
    return apiClient.post<TransactionSummary>('/transaction/summary', filter);
  },

  create: async (input: TransactionCreateInput): Promise<CreateResult> => {
    return apiClient.post<CreateResult>('/transaction/create', input);
  },

  update: async (input: TransactionUpdateInput): Promise<boolean> => {
    return apiClient.put<boolean>('/transaction/update', input);
  },

  togglePaid: async (transaction: number): Promise<boolean> => {
    return apiClient.put<boolean>('/transaction/toggle-paid', transaction);
  },

  delete: async (transaction: number): Promise<boolean> => {
    return apiClient.delete<boolean>('/transaction/delete', transaction);
  },

  duplicate: async (transaction: number): Promise<number> => {
    return apiClient.post<number>('/transaction/duplicate', transaction);
  },

  batchPay: async (input: BatchPayInput): Promise<boolean> => {
    return apiClient.post<boolean>('/transaction/batch-pay', input);
  },

  batchUnpay: async (ids: number[]): Promise<boolean> => {
    return apiClient.post<boolean>('/transaction/batch-unpay', { ids });
  },

  batchDelete: async (ids: number[]): Promise<boolean> => {
    return apiClient.post<boolean>('/transaction/batch-delete', { ids });
  },

  batchChangeDay: async (input: BatchChangeDayInput): Promise<boolean> => {
    return apiClient.post<boolean>('/transaction/batch-change-day', input);
  },

  insertInstallmentBetween: async (transaction: number): Promise<number> => {
    return apiClient.post<number>('/transaction/insert-installment-between', transaction);
  },

  deleteGroup: async (input: DeleteGroupInput): Promise<boolean> => {
    const query = new URLSearchParams({
      groupId: String(input.groupId),
      type: input.type,
    }).toString();
    return apiClient.delete<boolean>(`/transaction/delete-group?${query}`);
  },

  updateGroup: async (input: UpdateGroupInput): Promise<number[]> => {
    return apiClient.put<number[]>('/transaction/update-group', input);
  },
};
