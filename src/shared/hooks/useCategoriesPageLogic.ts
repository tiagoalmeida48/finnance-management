import { useState } from 'react';
import { useCategories, useCreateCategory, useDeleteCategory } from './useCategories';
import { Category } from '../interfaces/category.interface';

export function useCategoriesPageLogic() {
    const { data: categories, isLoading } = useCategories();
    const createCategory = useCreateCategory();
    const deleteCategory = useDeleteCategory();

    const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const handleAddDefault = async () => {
        const defaults: Array<Parameters<typeof createCategory.mutateAsync>[0]> = [
            { name: 'Alimentacao', type: 'expense', color: '#D32F2F', icon: 'utensils' },
            { name: 'Moradia', type: 'expense', color: '#1976D2', icon: 'home' },
            { name: 'Transporte', type: 'expense', color: '#FBC02D', icon: 'car' },
            { name: 'Lazer', type: 'expense', color: '#388E3C', icon: 'coffee' },
            { name: 'Salario', type: 'income', color: '#D4AF37', icon: 'tag' },
        ];

        for (const cat of defaults) {
            await createCategory.mutateAsync(cat);
        }
    };

    const handleDelete = (category: Category) => {
        setSelectedCategory(category);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedCategory) return;
        try {
            await deleteCategory.mutateAsync(selectedCategory.id);
            setDeleteModalOpen(false);
            setSelectedCategory(undefined);
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };

    const handleEdit = (category: Category) => {
        setSelectedCategory(category);
        setModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedCategory(undefined);
        setModalOpen(true);
    };

    return {
        categories, isLoading, createCategory, deleteCategory,
        typeFilter, setTypeFilter,
        modalOpen, setModalOpen,
        selectedCategory, setSelectedCategory,
        deleteModalOpen, setDeleteModalOpen,
        handleAddDefault, handleDelete, handleConfirmDelete, handleEdit, handleAdd
    };
}
