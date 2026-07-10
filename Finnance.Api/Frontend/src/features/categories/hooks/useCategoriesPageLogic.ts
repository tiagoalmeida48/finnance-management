import { useMemo, useState } from 'react';
import { CategoryTypeId } from '@/config/constants';
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useToggleCategoryActive,
  useUpdateCategory,
} from './useCategories';
import type { CategoryFormValues } from '../components/CategoryFormModal';
import type { Category } from '../types/categories.types';

export type CategoryTypeFilter = 'all' | 'income' | 'expense';

export function useCategoriesPageLogic() {
  const categoriesQuery = useCategories(true);
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const toggleCategoryActive = useToggleCategoryActive();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);
  const [typeFilter, setTypeFilter] = useState<CategoryTypeFilter>('all');

  const allCategories = useMemo<Category[]>(
    () => categoriesQuery.data ?? [],
    [categoriesQuery.data],
  );

  const categories = useMemo<Category[]>(() => {
    if (typeFilter === 'all') return allCategories;
    const target = typeFilter === 'income' ? CategoryTypeId.INCOME : CategoryTypeId.EXPENSE;
    return allCategories.filter((item) => item.categoryType === target);
  }, [allCategories, typeFilter]);

  const isEmpty = !categoriesQuery.isLoading && (categoriesQuery.data ?? []).length === 0;

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const submitForm = (values: CategoryFormValues) => {
    if (editing) {
      updateCategory.mutate(
        { ...values, category: editing.category, active: editing.active },
        { onSuccess: closeForm },
      );
      return;
    }
    createCategory.mutate(values, { onSuccess: closeForm });
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteCategory.mutate(pendingDelete.category, {
      onSuccess: () => setPendingDelete(null),
    });
  };

  const toggleActive = (category: Category) => {
    toggleCategoryActive.mutate(category);
  };

  return {
    categories,
    hasCategories: allCategories.length > 0,
    typeFilter,
    setTypeFilter,
    isEmpty,
    isLoading: categoriesQuery.isLoading,
    isError: categoriesQuery.isError,
    formOpen,
    editing,
    pendingDelete,
    saving: createCategory.isPending || updateCategory.isPending,
    deleting: deleteCategory.isPending,
    openCreate,
    openEdit,
    closeForm,
    submitForm,
    requestDelete: setPendingDelete,
    cancelDelete: () => setPendingDelete(null),
    confirmDelete,
    toggleActive,
    toggling: toggleCategoryActive.isPending,
  };
}
