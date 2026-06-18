import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountsService } from '@/shared/services/accounts.service';
import { Account } from '@/shared/interfaces';
import { queryKeys } from '@/shared/constants/queryKeys';
import { useToast } from '@/shared/contexts/useToast';

export function useAccounts() {
  return useQuery({
    queryKey: queryKeys.accounts.all,
    queryFn: () => accountsService.getAll(),
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (data: Omit<Account, 'id' | 'user_id' | 'created_at' | 'updated_at'>) =>
      accountsService.create(data),
    onSuccess: () => {
      toast.success('Conta criada com sucesso!');
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Account> }) =>
      accountsService.update(id, updates),
    onSuccess: () => {
      toast.success('Conta atualizada com sucesso!');
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id: string) => accountsService.delete(id),
    onSuccess: () => {
      toast.success('Conta removida com sucesso!');
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
    },
  });
}
