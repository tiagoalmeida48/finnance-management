import { useQuery, useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { transactionsService } from '@/shared/services/transactions.service';
<<<<<<< HEAD
import { transactionsCoreService } from '@/shared/services/transactions/transactions-core.service';
import type { TransactionsPaginatedParams, TransactionsSummaryParams } from '@/shared/constants/queryKeys';
=======
>>>>>>> finnance-management/main
import { Transaction, CreateTransactionData } from '@/shared/interfaces';
import { queryKeys } from '@/shared/constants/queryKeys';
import { useToast } from '@/shared/contexts/useToast';

const invalidateTransactionsAndAccounts = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.cards.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.transactions.recent });
};

export function useTransactions(filters?: Parameters<typeof transactionsService.getAll>[0]) {
  return useQuery({
    queryKey: queryKeys.transactions.list(filters),
    queryFn: () => transactionsService.getAll(filters),
  });
}

export function useTransactionsPaginated(params: TransactionsPaginatedParams) {
  return useQuery({
    queryKey: queryKeys.transactions.paginated(params),
    queryFn: () => transactionsCoreService.getPaginated(params),
    placeholderData: (prev) => prev,
  });
}

export function useTransactionsSummaries(params: TransactionsSummaryParams) {
  return useQuery({
    queryKey: queryKeys.transactions.summaries(params),
    queryFn: () => transactionsCoreService.getSummaries(params),
    staleTime: 60_000,
  });
}



export function useFirstTransactionDate() {
  return useQuery({
    queryKey: queryKeys.transactions.firstDate,
    queryFn: () => transactionsService.getFirstTransactionDate(),
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (data: CreateTransactionData) => transactionsService.create(data),
    onSuccess: () => {
      toast.success('Transação criada com sucesso!');
      invalidateTransactionsAndAccounts(queryClient);
    },
  });
}

export function useBatchCreateTransactions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (transactions: Partial<Transaction>[]) =>
      transactionsService.batchCreate(transactions),
    onSuccess: () => {
      invalidateTransactionsAndAccounts(queryClient);
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Transaction> }) =>
      transactionsService.update(id, updates),
    onSuccess: () => {
      toast.success('Transação atualizada com sucesso!');
      invalidateTransactionsAndAccounts(queryClient);
    },
  });
}

export function useTogglePaymentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, currentStatus }: { id: string; currentStatus: boolean }) =>
      transactionsService.togglePaymentStatus(id, currentStatus),
    onSuccess: () => {
      invalidateTransactionsAndAccounts(queryClient);
    },
  });
}

export function useBatchPayTransactions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      ids,
      accountId,
      paymentDate,
    }: {
      ids: string[];
      accountId: string;
      paymentDate?: string;
    }) => {
      return transactionsService.batchPay(ids, accountId, paymentDate || '');
    },
    onSuccess: () => {
      invalidateTransactionsAndAccounts(queryClient);
    },
  });
}

export function useBatchUnpayTransactions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => transactionsService.batchUnpay(ids),
    onSuccess: () => {
      invalidateTransactionsAndAccounts(queryClient);
    },
  });
}

export function useBatchDeleteTransactions() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (ids: string[]) => transactionsService.batchDelete(ids),
    onSuccess: () => {
      toast.success('Transações removidas com sucesso!');
      invalidateTransactionsAndAccounts(queryClient);
    },
  });
}

export function useBatchChangeTransactionDay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, day }: { ids: string[]; day: number }) =>
      transactionsService.batchChangeDay(ids, day),
    onSuccess: () => {
      invalidateTransactionsAndAccounts(queryClient);
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id: string) => transactionsService.delete(id),
    onSuccess: () => {
      toast.success('Transação removida com sucesso!');
      invalidateTransactionsAndAccounts(queryClient);
    },
  });
}

export function useDeleteTransactionGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, type }: { groupId: string; type: 'installment' | 'recurring' }) =>
      transactionsService.deleteGroup(groupId, type),
    onSuccess: () => {
      invalidateTransactionsAndAccounts(queryClient);
    },
  });
}

export function useDuplicateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => transactionsService.duplicate(id),
    onSuccess: () => {
      invalidateTransactionsAndAccounts(queryClient);
    },
  });
}

export function useInsertInstallmentBetween() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => transactionsService.insertInstallmentBetween(id),
    onSuccess: () => {
      invalidateTransactionsAndAccounts(queryClient);
    },
  });
}

export function useUpdateTransactionGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      type,
      updates,
    }: {
      groupId: string;
      type: 'installment' | 'recurring';
      updates: Partial<Transaction>;
    }) => transactionsService.updateGroup(groupId, type, updates),
    onSuccess: () => {
      invalidateTransactionsAndAccounts(queryClient);
    },
  });
}

export function usePayBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      cardId: string;
      transactionIds: string[];
      accountId: string;
      paymentDate: string;
      amount: number;
      description: string;
    }) =>
      transactionsService.payBill(
        data.cardId,
        data.transactionIds,
        data.accountId,
        data.paymentDate,
        data.amount,
        data.description,
      ),
    onSuccess: () => {
      invalidateTransactionsAndAccounts(queryClient);
      queryClient.invalidateQueries({ queryKey: queryKeys.cards.all });
    },
  });
}
