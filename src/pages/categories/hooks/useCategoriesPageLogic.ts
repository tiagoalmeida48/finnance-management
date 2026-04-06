import { useState } from 'react';
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
} from '@/shared/hooks/api/useCategories';
import { Category } from '@/shared/interfaces/category.interface';
import { DEFAULT_CATEGORY_SEED } from '@/shared/constants/categoryColors';

export function useCategoriesPageLogic() {
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuCategory, setMenuCategory] = useState<Category | null>(null);

  const handleAddDefault = async () => {
    const defaults: Array<Parameters<typeof createCategory.mutateAsync>[0]> = [
      ...DEFAULT_CATEGORY_SEED,
    ];

    for (const cat of defaults) {
      await createCategory.mutateAsync(cat);
    }
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, category: Category) => {
    setAnchorEl(event.currentTarget);
    setMenuCategory(category);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleDelete = () => {
    if (!menuCategory) return;
    setSelectedCategory(menuCategory);
    setDeleteModalOpen(true);
    handleCloseMenu();
  };

  const handleConfirmDelete = async () => {
    if (!selectedCategory) return;
    try {
      await deleteCategory.mutateAsync(selectedCategory.id);
      setDeleteModalOpen(false);
      setSelectedCategory(undefined);
    } catch {
      //
    }
  };

  const handleEdit = () => {
    if (!menuCategory) return;
    setSelectedCategory(menuCategory);
    setModalOpen(true);
    handleCloseMenu();
  };

  const handleAdd = () => {
    setSelectedCategory(undefined);
    setModalOpen(true);
  };

  return {
    categories,
    isLoading,
    createCategory,
    deleteCategory,
    modalOpen,
    setModalOpen,
    selectedCategory,
    setSelectedCategory,
    deleteModalOpen,
    setDeleteModalOpen,
    anchorEl,
    setAnchorEl,
    menuCategory,
    setMenuCategory,
    handleOpenMenu,
    handleCloseMenu,
    handleAddDefault,
    handleDelete,
    handleConfirmDelete,
    handleEdit,
    handleAdd,
  };
}
