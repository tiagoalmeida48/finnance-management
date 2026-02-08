import { Box, Typography, IconButton } from '@mui/material';
import { CreditCard as CardIcon, BarChart3, Pencil, Trash2 } from 'lucide-react';
import { CreditCard as CardInterface } from '../../interfaces/credit-card.interface';

interface CreditCardCardProps {
    card: CardInterface;
    navigate: any;
    handleEdit: (card: CardInterface) => void;
    handleDelete: (card: CardInterface) => void;
}

const colors = {
    bgCard: '#14141E',
    bgCardHover: '#1A1A28',
    bgMini: 'rgba(255,255,255,0.03)',
    border: 'rgba(255,255,255,0.06)',
    textPrimary: '#F0F0F5',
    textSecondary: '#8B8B9E',
    textMuted: '#5A5A6E',
    green: '#10B981',
    yellow: '#F5A623',
    red: '#EF4444',
};

export function CreditCardCard({ card, navigate, handleEdit, handleDelete }: CreditCardCardProps) {
    const usagePercent = card.credit_limit > 0
        ? Math.min(((card.usage || 0) / card.credit_limit) * 100, 100)
        : 0;

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const getProgressColor = () => {
        if (usagePercent >= 80) return colors.red;
        if (usagePercent >= 50) return colors.yellow;
        return card.color || '#C9A84C';
    };

    return (
        <Box
            sx={{
                bgcolor: colors.bgCard,
                border: `1px solid ${colors.border}`,
                borderRadius: '16px',
                borderLeft: `3px solid ${card.color || '#C9A84C'}`,
                p: 3,
                cursor: 'pointer',
                transition: 'all 300ms ease',
                '&:hover': {
                    bgcolor: colors.bgCardHover,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                    transform: 'translateY(-2px)',
                },
            }}
        >
            {/* Header: Icon + Name + Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: '12px',
                            bgcolor: `${card.color || '#C9A84C'}20`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: card.color || '#C9A84C',
                        }}
                    >
                        <CardIcon size={20} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: '18px', fontWeight: 700, color: colors.textPrimary, fontFamily: 'Plus Jakarta Sans' }}>
                            {card.name}
                        </Typography>
                        <Typography sx={{ fontSize: '13px', color: colors.textSecondary, fontFamily: 'DM Sans' }}>
                            Venc: <Box component="span" sx={{ fontWeight: 600 }}>{card.due_day}</Box> • Fecha: <Box component="span" sx={{ fontWeight: 600 }}>{card.closing_day}</Box>
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); navigate(`/cards/${card.id}`); }}
                        sx={{
                            width: 34,
                            height: 34,
                            borderRadius: '8px',
                            color: colors.textMuted,
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.06)', color: colors.textPrimary },
                        }}
                        title="Ver Detalhes"
                    >
                        <BarChart3 size={18} />
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); handleEdit(card); }}
                        sx={{
                            width: 34,
                            height: 34,
                            borderRadius: '8px',
                            color: colors.textMuted,
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.06)', color: colors.textPrimary },
                        }}
                    >
                        <Pencil size={18} />
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); handleDelete(card); }}
                        sx={{
                            width: 34,
                            height: 34,
                            borderRadius: '8px',
                            color: colors.textMuted,
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.06)', color: colors.red },
                        }}
                    >
                        <Trash2 size={18} />
                    </IconButton>
                </Box>
            </Box>

            {/* Usage Section */}
            <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: colors.textMuted, mb: 1 }}>
                    LIMITE UTILIZADO
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
                    <Typography sx={{ fontSize: '22px', fontWeight: 700, color: colors.textPrimary, fontFamily: 'Plus Jakarta Sans' }}>
                        {formatCurrency(card.usage || 0)}
                    </Typography>
                    <Typography sx={{ fontSize: '13px', color: colors.textMuted }}>
                        de {formatCurrency(card.credit_limit)}
                    </Typography>
                </Box>
                {/* Progress Bar */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ flex: 1, height: 8, borderRadius: '4px', bgcolor: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <Box
                            sx={{
                                width: `${usagePercent}%`,
                                height: '100%',
                                borderRadius: '4px',
                                bgcolor: getProgressColor(),
                                transition: 'width 300ms ease, background-color 300ms ease',
                            }}
                        />
                    </Box>
                    <Typography sx={{ fontSize: '12px', fontWeight: 600, color: getProgressColor(), minWidth: 45, textAlign: 'right' }}>
                        {usagePercent.toFixed(1)}%
                    </Typography>
                </Box>
            </Box>

            {/* Mini Cards: Disponível + Próx. Fatura */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                <Box sx={{ bgcolor: colors.bgMini, borderRadius: '10px', p: 1.75 }}>
                    <Typography sx={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', color: colors.textMuted, mb: 0.5 }}>
                        DISPONÍVEL
                    </Typography>
                    <Typography sx={{ fontSize: '16px', fontWeight: 700, color: colors.green, fontFamily: 'Plus Jakarta Sans' }}>
                        {formatCurrency(card.available_limit || 0)}
                    </Typography>
                </Box>
                <Box sx={{ bgcolor: colors.bgMini, borderRadius: '10px', p: 1.75 }}>
                    <Typography sx={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', color: colors.textMuted, mb: 0.5 }}>
                        FATURA ATUAL
                    </Typography>
                    <Typography sx={{ fontSize: '16px', fontWeight: 700, color: colors.yellow, fontFamily: 'Plus Jakarta Sans' }}>
                        {formatCurrency(card.current_invoice || 0)}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}
