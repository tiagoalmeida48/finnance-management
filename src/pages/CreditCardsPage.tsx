import { Box, Container, Typography, Grid, Card, Button, Stack, CircularProgress } from '@mui/material';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCreditCardsPageLogic } from '../shared/hooks/useCreditCardsPageLogic';
import { CreditCardCard } from '../shared/components/cards/CreditCardCard';
import { CardFormModal } from '../shared/components/cards/CardFormModal';
import { DeleteConfirmationModal } from '../shared/components/common/DeleteConfirmationModal';

export function CreditCardsPage() {
    const navigate = useNavigate();
    const {
        cards, isLoading, deleteCard,
        modalOpen, setModalOpen,
        selectedCard, setSelectedCard,
        deleteModalOpen, setDeleteModalOpen,
        handleEdit, handleDelete, handleConfirmDelete, handleAdd
    } = useCreditCardsPageLogic();

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    return (
        <Box sx={{ pt: 4, pb: 6 }}>
            <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Cartões de Crédito</Typography>
                        <Typography color="text.secondary">Gerencie seus limites e faturas em um só lugar.</Typography>
                    </Box>
                    <Button variant="contained" startIcon={<Plus />} size="large" onClick={handleAdd}>
                        Novo Cartão
                    </Button>
                </Stack>

                <Grid container spacing={3}>
                    {cards?.length === 0 ? (
                        <Grid size={12}>
                            <Card sx={{ textAlign: 'center', py: 8, bgcolor: 'background.paper', border: '1px solid #2A2A2A' }}>
                                <Typography color="text.secondary">Nenhum cartão cadastrado ainda.</Typography>
                            </Card>
                        </Grid>
                    ) : cards?.map((card) => (
                        <CreditCardCard
                            key={card.id}
                            card={card}
                            navigate={navigate}
                            handleEdit={handleEdit}
                            handleDelete={handleDelete}
                        />
                    ))}
                </Grid>

                <CardFormModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    card={selectedCard || undefined}
                />

                <DeleteConfirmationModal
                    open={deleteModalOpen}
                    onClose={() => {
                        setDeleteModalOpen(false);
                        setSelectedCard(null);
                    }}
                    onConfirm={handleConfirmDelete}
                    title="Excluir Cartão"
                    description="Tem certeza que deseja excluir este cartão? Todas as transações parceladas vinculadas a ele serão afetadas."
                    itemName={selectedCard?.name}
                    loading={deleteCard.isPending}
                />
            </Container>
        </Box>
    );
}
