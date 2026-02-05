import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesService, Category } from '../services/categories.service';

const CATEGORIES_QUERY_KEY = ['categories'];

export function useCategories() {
    return useQuery({
        queryKey: CATEGORIES_QUERY_KEY,
        queryFn: categoriesService.getAll,
    });
}

export function useCreateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: categoriesService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
        },
    });
}

export function useUpdateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<Category> }) =>
            categoriesService.update(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
        },
    });
}

export function useDeleteCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: categoriesService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
        },
    });
}
