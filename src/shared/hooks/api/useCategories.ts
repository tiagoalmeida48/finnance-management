import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesService } from "@/shared/services/categories.service";
import { Category } from "@/shared/interfaces";
import { queryKeys } from "@/shared/constants/queryKeys";

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: categoriesService.getAll,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: categoriesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Category> }) =>
      categoriesService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: categoriesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}
