import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/shared/types/api.types';
import { useToast } from '@/shared/components/feedback/useToast';
import { usersService } from '../services/usersService';
import type {
  CreateUserInput,
  ManagedUser,
  UpdateUserInput,
  UpdateUserPasswordInput,
} from '../types/users.types';

export const usersKeys = {
  all: ['users'] as const,
  list: (includeInactive = false) => [...usersKeys.all, 'list', includeInactive] as const,
};

function resolveErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}

export function useUsers(includeInactive = false) {
  return useQuery({
    queryKey: usersKeys.list(includeInactive),
    queryFn: () => usersService.list(includeInactive),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (input: CreateUserInput) => usersService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.all });
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
      queryClient.invalidateQueries({ queryKey: usersKeys.all });
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

export function useToggleUserActive() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (user: ManagedUser) => usersService.toggleActive(user.user),
    onSuccess: (_, user) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.all });
      addToast(user.active ? 'Usuário desativado.' : 'Usuário ativado.', 'success');
    },
    onError: (error: unknown) => {
      addToast(
        resolveErrorMessage(error, 'Não foi possível alterar o status do usuário.'),
        'error',
      );
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (user: number) => usersService.remove(user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.all });
      addToast('Usuário removido com sucesso.', 'success');
    },
    onError: (error: unknown) => {
      addToast(resolveErrorMessage(error, 'Não foi possível remover o usuário.'), 'error');
    },
  });
}
