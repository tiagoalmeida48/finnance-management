import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/shared/types/api.types';
import { useToast } from '@/shared/components/feedback/useToast';
import { usersService } from '../services/usersService';
import type {
  CreateUserInput,
  UpdateUserInput,
  UpdateUserPasswordInput,
} from '../types/users.types';

export const usersKeys = {
  all: ['users'] as const,
  list: () => [...usersKeys.all, 'list'] as const,
};

function resolveErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}

export function useUsers() {
  return useQuery({
    queryKey: usersKeys.list(),
    queryFn: usersService.list,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (input: CreateUserInput) => usersService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.list() });
      addToast('Usuário criado com sucesso.', 'success');
    },
    onError: (error: unknown) => {
      addToast(resolveErrorMessage(error, 'Não foi possível criar o usuário.'), 'error');
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (input: UpdateUserInput) => usersService.update(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.list() });
      addToast('Usuário atualizado com sucesso.', 'success');
    },
    onError: (error: unknown) => {
      addToast(resolveErrorMessage(error, 'Não foi possível atualizar o usuário.'), 'error');
    },
  });
}

export function useUpdateUserPassword() {
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (input: UpdateUserPasswordInput) => usersService.updatePassword(input),
    onSuccess: () => {
      addToast('Senha atualizada com sucesso.', 'success');
    },
    onError: (error: unknown) => {
      addToast(resolveErrorMessage(error, 'Não foi possível atualizar a senha.'), 'error');
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (user: number) => usersService.remove(user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.list() });
      addToast('Usuário removido com sucesso.', 'success');
    },
    onError: (error: unknown) => {
      addToast(resolveErrorMessage(error, 'Não foi possível remover o usuário.'), 'error');
    },
  });
}
