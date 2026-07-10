import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/shared/components/feedback';
import { categoriesService } from '../services/categoriesService';
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../types/categories.types';

export const categoriesKeys = {
  all: ['categories'] as const,
  list: (includeInactive: boolean) => [...categoriesKeys.all, 'list', includeInactive] as const,
  types: ['category-types'] as const,
};

export function useCategories(includeInactive = false) {
  return useQuery({
    queryKey: categoriesKeys.list(includeInactive),
    queryFn: () => categoriesService.list(includeInactive),
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

export function useToggleCategoryActive() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (category: Category) => categoriesService.toggleActive(category.category),
    onSuccess: (_, category) => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.all });
      addToast(category.active ? 'Categoria desativada.' : 'Categoria ativada.', 'success');
    },
    onError: () => {
      addToast('Não foi possível alterar o status da categoria.', 'error');
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
