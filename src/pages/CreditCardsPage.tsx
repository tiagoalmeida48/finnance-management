import { Box, Container, Typography, Button, CircularProgress } from '@mui/material';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCreditCardsPageLogic } from '../shared/hooks/useCreditCardsPageLogic';
import { CreditCardCard } from '../shared/components/cards/CreditCardCard';
import { CardFormModal } from '../shared/components/cards/CardFormModal';
import { DeleteConfirmationModal } from '../shared/components/common/DeleteConfirmationModal';

const colors = {
    textPrimary: '#F0F0F5',
    textSecondary: '#8B8B9E',
    textMuted: '#5A5A6E',
    accent: '#C9A84C',
    bgCard: '#14141E',
    border: 'rgba(255,255,255,0.06)',
};

export function CreditCardsPage() {
    const navigate = useNavigate();
    const {
        cards, isLoading, deleteCard,
        modalOpen, setModalOpen,
        selectedCard, setSelectedCard,
        deleteModalOpen, setDeleteModalOpen,
        handleEdit, handleDelete, handleConfirmDelete, handleAdd
    } = useCreditCardsPageLogic();

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const totalLimit = cards?.reduce((sum, c) => sum + (c.credit_limit || 0), 0) || 0;
    const totalUsage = cards?.reduce((sum, c) => sum + (c.usage || 0), 0) || 0;

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress sx={{ color: colors.accent }} />
            </Box>
        );
    }

    return (
        <Box sx={{ pt: 4, pb: 6 }}>
            <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography sx={{ fontSize: '28px', fontWeight: 700, color: colors.textPrimary, fontFamily: 'Plus Jakarta Sans', mb: 0.5 }}>
                            Cartões de Crédito
                        </Typography>
                        <Typography sx={{ fontSize: '14px', color: colors.textMuted, fontFamily: 'DM Sans', mb: 1 }}>
                            Gerencie seus limites e faturas em um só lugar.
                        </Typography>
                        {cards && cards.length > 0 && (
                            <Typography sx={{ fontSize: '13px', color: colors.textSecondary, fontFamily: 'DM Sans' }}>
                                {cards.length} cartão{cards.length > 1 ? 'es' : ''}
                                <Box component="span" sx={{ mx: 1, color: colors.textMuted }}>•</Box>
                                Limite total: {formatCurrency(totalLimit)}
                                <Box component="span" sx={{ mx: 1, color: colors.textMuted }}>•</Box>
                                Utilizado: {formatCurrency(totalUsage)}
                            </Typography>
                        )}
                    </Box>
                    <Button
                        startIcon={<Plus size={18} />}
                        onClick={handleAdd}
                        sx={{
                            bgcolor: colors.accent,
                            color: '#0A0A0F',
                            fontWeight: 600,
                            fontSize: '13px',
                            borderRadius: '10px',
                            px: 2.5,
                            py: 1.25,
                            boxShadow: '0 2px 8px rgba(201, 168, 76, 0.25)',
                            textTransform: 'none',
                            '&:hover': {
                                bgcolor: '#D4B85C',
                                transform: 'translateY(-1px)',
                            },
                        }}
                    >
                        Novo Cartão
                    </Button>
                </Box>

                {/* Cards Grid */}
                {cards?.length === 0 ? (
                    <Box sx={{ bgcolor: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '16px', textAlign: 'center', py: 8 }}>
                        <Typography sx={{ color: colors.textSecondary }}>Nenhum cartão cadastrado ainda.</Typography>
                    </Box>
                ) : (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(auto-fill, minmax(600px, 1fr))' }, gap: 2.5 }}>
                        {cards?.map((card) => (
                            <CreditCardCard
                                key={card.id}
                                card={card}
                                navigate={navigate}
                                handleEdit={handleEdit}
                                handleDelete={handleDelete}
                            />
                        ))}
                    </Box>
                )}

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
