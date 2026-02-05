import { Grid, Card, CardContent, Box, Typography, IconButton, Divider, LinearProgress } from '@mui/material';
import { CreditCard as CardIcon, BarChart3, Pencil, Trash2, ShieldCheck, Calendar } from 'lucide-react';
import { CreditCard as CardInterface } from '../../interfaces/credit-card.interface';

interface CreditCardCardProps {
    card: CardInterface;
    navigate: any;
    handleEdit: (card: CardInterface) => void;
    handleDelete: (card: CardInterface) => void;
}

export function CreditCardCard({ card, navigate, handleEdit, handleDelete }: CreditCardCardProps) {
    const usagePercent = Math.min(((card.usage || 0) / card.credit_limit) * 100, 100);

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    return (
        <Grid size={{ xs: 12, md: 6 }}>
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
                                {formatCurrency(card.usage || 0)}
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
                                {formatCurrency(card.credit_limit)}
                            </Typography>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Calendar size={12} /> Disponível
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main' }}>
                                {formatCurrency(card.available_limit || 0)}
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Grid>
    );
}
