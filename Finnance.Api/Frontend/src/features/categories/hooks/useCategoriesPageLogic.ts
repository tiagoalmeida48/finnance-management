import { useMemo, useState } from 'react';
import { CategoryTypeId } from '@/config/constants';
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from './useCategories';
import type { CategoryFormValues } from '../components/CategoryFormModal';
import type { Category } from '../types/categories.types';

interface CategoryGroup {
  type: number;
  label: string;
  items: Category[];
}

const GROUP_ORDER = [
  { type: CategoryTypeId.INCOME, label: 'Receitas' },
  { type: CategoryTypeId.EXPENSE, label: 'Despesas' },
];

export function useCategoriesPageLogic() {
  const categoriesQuery = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);

  const groups = useMemo<CategoryGroup[]>(() => {
    const items = categoriesQuery.data ?? [];
    return GROUP_ORDER.map((group) => ({
      ...group,
      items: items
        .filter((item) => item.categoryType === group.type)
        .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })),
    })).filter((group) => group.items.length > 0);
  }, [categoriesQuery.data]);

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

  return {
    groups,
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
  };
}
