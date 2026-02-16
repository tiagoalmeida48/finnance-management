import { useMemo, useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    Button,
    Stack,
    ToggleButtonGroup,
    ToggleButton,
    TextField,
    InputAdornment,
} from '@mui/material';
import { Plus, Search, Sparkles } from 'lucide-react';
import { useCategoriesPageLogic } from '../shared/hooks/useCategoriesPageLogic';
import { CategoryCard } from '../shared/components/categories/CategoryCard';
import { CategoryFormModal } from '../shared/components/categories/CategoryFormModal';
import { DeleteConfirmationModal } from '../shared/components/common/DeleteConfirmationModal';
import { colors } from '@/shared/theme';

export function CategoriesPage() {
    const {
        categories, isLoading, createCategory, deleteCategory,
        typeFilter, setTypeFilter,
        modalOpen, setModalOpen,
        selectedCategory, setSelectedCategory,
        deleteModalOpen, setDeleteModalOpen,
        handleAddDefault, handleDelete, handleConfirmDelete, handleEdit, handleAdd
    } = useCategoriesPageLogic();

    const [searchTerm, setSearchTerm] = useState('');

    const expenseCount = categories?.filter(c => c.type === 'expense').length || 0;
    const incomeCount = categories?.filter(c => c.type === 'income').length || 0;

    const filteredCategories = useMemo(() => {
        const base = categories?.filter(c => typeFilter === 'all' || c.type === typeFilter) || [];
        const q = searchTerm.trim().toLowerCase();
        if (!q) return base;
        return base.filter(c => c.name.toLowerCase().includes(q));
    }, [categories, typeFilter, searchTerm]);

    const modalDefaultType = typeFilter === 'all' ? 'expense' : typeFilter;

    return (
        <Box sx={{ pt: 4, pb: 6 }}>
            <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', md: 'center' }}
                    spacing={2}
                    sx={{ mb: 3 }}
                >
                    <Box>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '24px', md: '34px' } }}>Categorias</Typography>
                            <Sparkles size={16} color={colors.accent} />
                        </Stack>
                        <Typography color="text.secondary" sx={{ fontSize: { xs: '14px', md: '1rem' } }}>
                            Organize suas transacoes por grupos inteligentes.
                        </Typography>
                    </Box>

                    <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: { xs: 2, md: 0 } }}>
                        {categories?.length === 0 && (
                            <Button
                                variant="outlined"
                                onClick={handleAddDefault}
                                disabled={createCategory.isPending}
                                sx={{ borderColor: colors.border, flex: { xs: 1, sm: 'none' } }}
                            >
                                Adicionar padroes
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            startIcon={<Plus size={16} />}
                            size="large"
                            onClick={handleAdd}
                            sx={{ flex: { xs: 1, sm: 'none' } }}
                        >
                            Nova Categoria
                        </Button>
                    </Stack>
                </Stack>

                <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems={{ lg: 'center' }} justifyContent="space-between" sx={{ mb: 3 }}>
                    <ToggleButtonGroup
                        value={typeFilter}
                        exclusive
                        onChange={(_, value) => value && setTypeFilter(value)}
                        sx={{
                            bgcolor: 'rgba(255,255,255,0.02)',
                            borderRadius: '12px',
                            p: 0.5,
                            '& .MuiToggleButtonGroup-grouped': {
                                border: 'none',
                                px: 2.75,
                                borderRadius: '9px !important',
                                color: colors.textSecondary,
                                fontWeight: 600,
                                '&.Mui-selected': {
                                    bgcolor: 'rgba(255,255,255,0.08)',
                                    color: colors.textPrimary,
                                },
                            },
                        }}
                    >
                        <ToggleButton value="all">Todas ({categories?.length || 0})</ToggleButton>
                        <ToggleButton value="expense">Despesas ({expenseCount})</ToggleButton>
                        <ToggleButton value="income">Receitas ({incomeCount})</ToggleButton>
                    </ToggleButtonGroup>

                    <TextField
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar categoria..."
                        size="small"
                        sx={{ minWidth: { xs: '100%', lg: 300 } }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search size={16} color={colors.textMuted} />
                                    </InputAdornment>
                                ),
                            }
                        }}
                    />
                </Stack>

                <Grid container spacing={2.25}>
                    {isLoading ? (
                        <Grid size={{ xs: 12 }}>
                            <Card sx={{ textAlign: 'center', py: 8 }}>
                                <Typography color="text.secondary">Carregando categorias...</Typography>
                            </Card>
                        </Grid>
                    ) : filteredCategories.length === 0 ? (
                        <Grid size={{ xs: 12 }}>
                            <Card sx={{ textAlign: 'center', py: 8, border: `1px dashed ${colors.border}` }}>
                                <Typography sx={{ color: colors.textPrimary, fontWeight: 600, mb: 0.75 }}>
                                    Nenhuma categoria encontrada
                                </Typography>
                                <Typography color="text.secondary" sx={{ mb: 2 }}>
                                    Ajuste sua busca ou crie uma nova categoria.
                                </Typography>
                                <Button variant="outlined" startIcon={<Plus size={16} />} onClick={handleAdd}>
                                    Criar categoria
                                </Button>
                            </Card>
                        </Grid>
                    ) : filteredCategories.map((category) => (
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
                    defaultType={modalDefaultType}
                />

                <DeleteConfirmationModal
                    open={deleteModalOpen}
                    onClose={() => {
                        setDeleteModalOpen(false);
                        setSelectedCategory(undefined);
                    }}
                    onConfirm={handleConfirmDelete}
                    title="Excluir Categoria"
                    description="Tem certeza que deseja excluir esta categoria? As transacoes vinculadas poderao ficar sem categoria."
                    itemName={selectedCategory?.name}
                    loading={deleteCategory.isPending}
                />
            </Container>
        </Box>
    );
}
