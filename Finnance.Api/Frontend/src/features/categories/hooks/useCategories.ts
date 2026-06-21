import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/shared/components/feedback';
import { categoriesService } from '../services/categoriesService';
import type { CreateCategoryInput, UpdateCategoryInput } from '../types/categories.types';

export const categoriesKeys = {
  all: ['categories'] as const,
  types: ['category-types'] as const,
};

export function useCategories() {
  return useQuery({
    queryKey: categoriesKeys.all,
    queryFn: categoriesService.list,
  });
}

export function useCategoryTypes() {
  return useQuery({
    queryKey: categoriesKeys.types,
    queryFn: categoriesService.listTypes,
    staleTime: Infinity,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (input: CreateCategoryInput) => categoriesService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.all });
      addToast('Categoria criada com sucesso.', 'success');
    },
    onError: () => {
      addToast('Não foi possível criar a categoria.', 'error');
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (input: UpdateCategoryInput) => categoriesService.update(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.all });
      addToast('Categoria atualizada com sucesso.', 'success');
    },
    onError: () => {
      addToast('Não foi possível atualizar a categoria.', 'error');
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (category: number) => categoriesService.remove(category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.all });
      addToast('Categoria excluída com sucesso.', 'success');
    },
    onError: () => {
      addToast('Não foi possível excluir a categoria.', 'error');
    },
  });
}
