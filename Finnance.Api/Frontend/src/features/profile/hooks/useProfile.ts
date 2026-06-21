import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/shared/components/feedback';
import { profileService } from '../services/profileService';
import type { UpdatePasswordInput, UpdateProfileInput } from '../types/profile.types';

export const profileKeys = {
  me: ['profile', 'me'] as const,
};

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => profileService.update(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me });
      addToast('Nome atualizado com sucesso.', 'success');
    },
    onError: () => {
      addToast('Não foi possível atualizar o perfil.', 'error');
    },
  });
}

export function useUpdatePassword() {
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (input: UpdatePasswordInput) => profileService.updatePassword(input),
    onSuccess: () => {
      addToast('Senha atualizada com sucesso.', 'success');
    },
    onError: () => {
      addToast('Não foi possível atualizar a senha.', 'error');
    },
  });
}
