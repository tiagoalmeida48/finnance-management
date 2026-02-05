import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    IconButton,
    Button,
    Stack,
    Divider,
    LinearProgress,
    CircularProgress
} from '@mui/material';
import { Plus, CreditCard as CardIcon, Pencil, Trash2, Calendar, ShieldCheck, BarChart3 } from 'lucide-react';
import { useCreditCards, useDeleteCreditCard } from '../hooks/useCreditCards';
import { CardFormModal } from '../components/CardFormModal';
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal';
import { CreditCard } from '@/types/database';

export function CreditCardsPage() {
    const navigate = useNavigate();
    const { data: cards, isLoading } = useCreditCards();
    const deleteCard = useDeleteCreditCard();

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const handleEdit = (card: CreditCard) => {
        setSelectedCard(card);
        setModalOpen(true);
    };

    const handleDelete = (card: CreditCard) => {
        setSelectedCard(card);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedCard) return;
        try {
            await deleteCard.mutateAsync(selectedCard.id);
            setDeleteModalOpen(false);
            setSelectedCard(null);
        } catch (error) {
            console.error('Error deleting card:', error);
        }
    };

    const handleAdd = () => {
        setSelectedCard(null);
        setModalOpen(true);
    };

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
                    ) : cards?.map((card: any) => {
                        const usagePercent = Math.min((card.usage / card.credit_limit) * 100, 100);

                        return (
                            <Grid size={{ xs: 12, md: 6 }} key={card.id}>
                                <Card sx={{
                                    bgcolor: 'background.paper',
                                    border: '1px solid #2A2A2A',
                                    position: 'relative',
                                    overflow: 'visible',
                                    '&:before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '4px',
                                        height: '100%',
                                        bgcolor: card.color || 'primary.main',
                                        borderRadius: '4px 0 0 4px'
                                    }
                                }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                                <Box sx={{
                                                    p: 1.5,
                                                    borderRadius: 1,
                                                    bgcolor: 'rgba(255,255,255,0.03)',
                                                    color: card.color || 'primary.main'
                                                }}>
                                                    <CardIcon size={24} />
                                                </Box>
                                                <Box>
                                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{card.name}</Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Vencimento dia {card.due_day} • Fecha dia {card.closing_day}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                {/* Pago via detalhes para garantir escolha da fatura correta */}
                                                <IconButton
                                                    size="small"
                                                    onClick={() => navigate(`/cards/${card.id}`)}
                                                    sx={{ color: 'text.secondary', mr: 1 }}
                                                    title="Ver Detalhes / Pagar"
                                                >
                                                    <BarChart3 size={18} />
                                                </IconButton>
                                                <IconButton size="small" onClick={() => handleEdit(card)} sx={{ color: 'text.secondary' }}>
                                                    <Pencil size={18} />
                                                </IconButton>
                                                <IconButton size="small" onClick={() => handleDelete(card)} sx={{ color: 'text.secondary' }}>
                                                    <Trash2 size={18} />
                                                </IconButton>
                                            </Box>
                                        </Box>

                                        <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.05)' }} />

                                        <Box sx={{ mb: 2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="body2" color="text.secondary">Limite Utilizado</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 700, color: usagePercent > 90 ? 'error.main' : 'inherit' }}>
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(card.usage)}
                                                </Typography>
                                            </Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={usagePercent}
                                                sx={{
                                                    height: 8,
                                                    borderRadius: 4,
                                                    bgcolor: 'rgba(255,255,255,0.05)',
                                                    '& .MuiLinearProgress-bar': {
                                                        bgcolor: usagePercent > 90 ? 'error.main' : (card.color || 'primary.main')
                                                    }
                                                }}
                                            />
                                        </Box>

                                        <Box sx={{ display: 'flex', gap: 4 }}>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <ShieldCheck size={12} /> Limite Total
                                                </Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(card.credit_limit)}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Calendar size={12} /> Disponível
                                                </Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main' }}>
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(card.available_limit)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
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
