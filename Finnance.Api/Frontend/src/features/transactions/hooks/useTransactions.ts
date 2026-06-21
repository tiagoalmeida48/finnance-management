import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/shared/components/feedback';
import { transactionsService } from '../services/transactionsService';
import type {
  BatchChangeDayInput,
  BatchPayInput,
  TransactionCreateInput,
  TransactionFilter,
  TransactionUpdateInput,
  UpdateGroupInput,
} from '../types/transactions.types';

export const transactionKeys = {
  all: ['transactions'] as const,
  list: (filter: TransactionFilter) => ['transactions', 'list', filter] as const,
  summary: (filter: TransactionFilter) => ['transactions', 'summary', filter] as const,
};

export function useTransactionsList(filter: TransactionFilter) {
  return useQuery({
    queryKey: transactionKeys.list(filter),
    queryFn: () => transactionsService.list(filter),
  });
}

export function useTransactionsSummary(filter: TransactionFilter) {
  return useQuery({
    queryKey: transactionKeys.summary(filter),
    queryFn: () => transactionsService.summary(filter),
  });
}

export function useTransactionMutations() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: transactionKeys.all });
  };

  const onError = (error: unknown) => {
    const message = error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
    addToast(message, 'error');
  };

  const create = useMutation({
    mutationFn: (input: TransactionCreateInput) => transactionsService.create(input),
    onSuccess: () => {
      invalidate();
      addToast('Transação criada com sucesso.', 'success');
    },
    onError,
  });

  const update = useMutation({
    mutationFn: (input: TransactionUpdateInput) => transactionsService.update(input),
    onSuccess: () => {
      invalidate();
      addToast('Transação atualizada com sucesso.', 'success');
    },
    onError,
  });

  const togglePaid = useMutation({
    mutationFn: (id: number) => transactionsService.togglePaid(id),
    onSuccess: () => invalidate(),
    onError,
  });

  const remove = useMutation({
    mutationFn: (id: number) => transactionsService.delete(id),
    onSuccess: () => {
      invalidate();
      addToast('Transação excluída.', 'success');
    },
    onError,
  });

  const duplicate = useMutation({
    mutationFn: (id: number) => transactionsService.duplicate(id),
    onSuccess: () => {
      invalidate();
      addToast('Transação duplicada.', 'success');
    },
    onError,
  });

  const batchPay = useMutation({
    mutationFn: (input: BatchPayInput) => transactionsService.batchPay(input),
    onSuccess: () => {
      invalidate();
      addToast('Lançamentos pagos.', 'success');
    },
    onError,
  });

  const batchUnpay = useMutation({
    mutationFn: (ids: number[]) => transactionsService.batchUnpay(ids),
    onSuccess: () => {
      invalidate();
      addToast('Lançamentos marcados como pendentes.', 'success');
    },
    onError,
  });

  const batchDelete = useMutation({
    mutationFn: (ids: number[]) => transactionsService.batchDelete(ids),
    onSuccess: () => {
      invalidate();
      addToast('Lançamentos excluídos.', 'success');
    },
    onError,
  });

  const batchChangeDay = useMutation({
    mutationFn: (input: BatchChangeDayInput) => transactionsService.batchChangeDay(input),
    onSuccess: () => {
      invalidate();
      addToast('Dia dos lançamentos atualizado.', 'success');
    },
    onError,
  });

  const updateGroup = useMutation({
    mutationFn: (input: UpdateGroupInput) => transactionsService.updateGroup(input),
    onSuccess: () => {
      invalidate();
      addToast('Grupo atualizado.', 'success');
    },
    onError,
  });

  return {
    create,
    update,
    togglePaid,
    remove,
    duplicate,
    batchPay,
    batchUnpay,
    batchDelete,
    batchChangeDay,
    updateGroup,
  };
}
