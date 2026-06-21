import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/shared/types/api.types';
import { useToast } from '@/shared/components/feedback/useToast';
import { accountsService } from '../services/accountsService';
import type { CreateAccountInput, UpdateAccountInput } from '../types/accounts.types';

export const accountsKeys = {
  all: ['accounts'] as const,
  list: () => [...accountsKeys.all, 'list'] as const,
  types: () => ['account-types'] as const,
};

function resolveErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}

export function useAccounts() {
  return useQuery({
    queryKey: accountsKeys.list(),
    queryFn: accountsService.list,
  });
}

export function useAccountTypes() {
  return useQuery({
    queryKey: accountsKeys.types(),
    queryFn: accountsService.listAccountTypes,
    staleTime: Infinity,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (input: CreateAccountInput) => accountsService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountsKeys.list() });
      addToast('Conta criada com sucesso.', 'success');
    },
    onError: (error: unknown) => {
      addToast(resolveErrorMessage(error, 'Não foi possível criar a conta.'), 'error');
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (input: UpdateAccountInput) => accountsService.update(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountsKeys.list() });
      addToast('Conta atualizada com sucesso.', 'success');
    },
    onError: (error: unknown) => {
      addToast(resolveErrorMessage(error, 'Não foi possível atualizar a conta.'), 'error');
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (bankAccount: number) => accountsService.remove(bankAccount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountsKeys.list() });
      addToast('Conta excluída com sucesso.', 'success');
    },
    onError: (error: unknown) => {
      addToast(resolveErrorMessage(error, 'Não foi possível excluir a conta.'), 'error');
    },
  });
}
