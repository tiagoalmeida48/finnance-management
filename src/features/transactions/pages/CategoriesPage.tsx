import { useState } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, IconButton, Button, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { Plus, Trash2, Tag, ShoppingCart, Coffee, Home, Car, Utensils, Heart, Pencil, Gift, Briefcase, Zap, Plane, Activity } from 'lucide-react';
import { useCategories, useCreateCategory, useDeleteCategory } from '../hooks/useCategories';
import { CategoryFormModal } from '../components/CategoryFormModal';
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal';
import { Category } from '../services/categories.service';

const iconMap: Record<string, any> = {
    'shopping-cart': <ShoppingCart size={20} />,
    'coffee': <Coffee size={20} />,
    'home': <Home size={20} />,
    'car': <Car size={20} />,
    'utensils': <Utensils size={20} />,
    'heart': <Heart size={20} />,
    'tag': <Tag size={20} />,
    'gift': <Gift size={20} />,
    'briefcase': <Briefcase size={20} />,
    'zap': <Zap size={20} />,
    'plane': <Plane size={20} />,
    'activity': <Activity size={20} />,
};

export function CategoriesPage() {
    const { data: categories, isLoading } = useCategories();
    const createCategory = useCreateCategory();
    const deleteCategory = useDeleteCategory();

    const [typeFilter, setTypeFilter] = useState<'expense' | 'income'>('expense');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const handleAddDefault = async () => {
        const defaults = [
            { name: 'Alimentação', type: 'expense', color: '#D32F2F', icon: 'utensils' },
            { name: 'Moradia', type: 'expense', color: '#1976D2', icon: 'home' },
            { name: 'Transporte', type: 'expense', color: '#FBC02D', icon: 'car' },
            { name: 'Lazer', type: 'expense', color: '#388E3C', icon: 'coffee' },
            { name: 'Salário', type: 'income', color: '#D4AF37', icon: 'tag' },
        ];

        for (const cat of defaults) {
            await createCategory.mutateAsync(cat as any);
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

    return (
        <Box sx={{ pt: 4, pb: 6 }}>
            <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Categorias</Typography>
                        <Typography color="text.secondary">Organize suas transações por grupos.</Typography>
                    </Box>
                    <Stack direction="row" spacing={2}>
                        {categories?.length === 0 && (
                            <Button variant="outlined" onClick={handleAddDefault} disabled={createCategory.isPending}>
                                Adicionar Padrões
                            </Button>
                        )}
                        <Button variant="contained" startIcon={<Plus />} size="large" onClick={handleAdd}>
                            Nova Categoria
                        </Button>
                    </Stack>
                </Stack>

                <ToggleButtonGroup
                    value={typeFilter}
                    exclusive
                    onChange={(_, value) => value && setTypeFilter(value)}
                    sx={{ mb: 4 }}
                >
                    <ToggleButton value="expense" sx={{ px: 4 }}>Despesas</ToggleButton>
                    <ToggleButton value="income" sx={{ px: 4 }}>Receitas</ToggleButton>
                </ToggleButtonGroup>

                <Grid container spacing={2}>
                    {isLoading ? (
                        <Grid size={{ xs: 12 }}><Typography>Carregando categorias...</Typography></Grid>
                    ) : categories?.filter(c => c.type === typeFilter).length === 0 ? (
                        <Grid size={{ xs: 12 }}>
                            <Card sx={{ textAlign: 'center', py: 8 }}>
                                <Typography color="text.secondary">Nenhuma categoria encontrada para este tipo.</Typography>
                            </Card>
                        </Grid>
                    ) : categories?.filter(c => c.type === typeFilter).map((category) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={category.id}>
                            <Card sx={{ borderLeft: `4px solid ${category.color || '#D4AF37'}`, position: 'relative' }}>
                                <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Box sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 1, color: category.color || '#D4AF37' }}>
                                                {iconMap[category.icon || 'tag'] || iconMap['tag']}
                                            </Box>
                                            <Typography sx={{ fontWeight: 600 }}>{category.name}</Typography>
                                        </Stack>
                                        <Stack direction="row">
                                            <IconButton size="small" onClick={() => handleEdit(category)} sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}>
                                                <Pencil size={16} />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => handleDelete(category)} color="error" sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}>
                                                <Trash2 size={16} />
                                            </IconButton>
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <CategoryFormModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    category={selectedCategory}
                    defaultType={typeFilter}
                />

                <DeleteConfirmationModal
                    open={deleteModalOpen}
                    onClose={() => {
                        setDeleteModalOpen(false);
                        setSelectedCategory(undefined);
                    }}
                    onConfirm={handleConfirmDelete}
                    title="Excluir Categoria"
                    description="Tem certeza que deseja excluir esta categoria? As transações vinculadas poderão ficar sem categoria."
                    itemName={selectedCategory?.name}
                    loading={deleteCategory.isPending}
                />
            </Container>
        </Box>
    );
}
