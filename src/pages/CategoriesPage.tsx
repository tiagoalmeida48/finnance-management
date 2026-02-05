import { Box, Container, Typography, Grid, Card, Button, Stack, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { Plus } from 'lucide-react';
import { useCategoriesPageLogic } from '../shared/hooks/useCategoriesPageLogic';
import { CategoryCard } from '../shared/components/categories/CategoryCard';
import { CategoryFormModal } from '../shared/components/categories/CategoryFormModal';
import { DeleteConfirmationModal } from '../shared/components/common/DeleteConfirmationModal';

export function CategoriesPage() {
    const {
        categories, isLoading, createCategory, deleteCategory,
        typeFilter, setTypeFilter,
        modalOpen, setModalOpen,
        selectedCategory, setSelectedCategory,
        deleteModalOpen, setDeleteModalOpen,
        handleAddDefault, handleDelete, handleConfirmDelete, handleEdit, handleAdd
    } = useCategoriesPageLogic();

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
                        <CategoryCard
                            key={category.id}
                            category={category}
                            handleEdit={handleEdit}
                            handleDelete={handleDelete}
                        />
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
