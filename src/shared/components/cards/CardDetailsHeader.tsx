import { Stack, Box, Typography, Button, IconButton, ToggleButtonGroup, ToggleButton, TextField } from '@mui/material';
import { ChevronLeft, ChevronRight, CreditCard as CardIcon, Wallet, TrendingDown, Percent } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CardDetailsHeaderProps {
    card: any;
    navigate: any;
    isAllTime: boolean;
    setIsAllTime: (val: boolean) => void;
    isCustom: boolean;
    setIsCustom: (val: boolean) => void;
    selectedDate: Date;
    handlePrevMonth: () => void;
    handleNextMonth: () => void;
    customStart: string;
    setCustomStart: (val: string) => void;
    customEnd: string;
    setCustomEnd: (val: string) => void;
}

const colors = {
    bgCard: '#14141E',
    border: 'rgba(255,255,255,0.06)',
    textPrimary: '#F0F0F5',
    textSecondary: '#8B8B9E',
    textMuted: '#5A5A6E',
    accent: '#C9A84C',
    green: '#10B981',
    yellow: '#F5A623',
    red: '#EF4444',
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export function CardDetailsHeader({
    card, navigate,
    isAllTime, setIsAllTime,
    isCustom, setIsCustom,
    selectedDate, handlePrevMonth, handleNextMonth,
    customStart, setCustomStart,
    customEnd, setCustomEnd
}: CardDetailsHeaderProps) {
    const usagePercent = card.credit_limit > 0
        ? Math.min(((card.usage || 0) / card.credit_limit) * 100, 100)
        : 0;

    const getUsageColor = () => {
        if (usagePercent >= 80) return colors.red;
        if (usagePercent >= 50) return colors.yellow;
        return colors.green;
    };

    return (
        <>
            {/* Back Button + Filters */}
            <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', lg: 'center' }} sx={{ mb: 3, gap: 2 }}>
                <Button
                    startIcon={<ChevronLeft size={16} />}
                    onClick={() => navigate('/cards')}
                    sx={{ color: colors.textMuted, fontSize: '13px', fontWeight: 500, alignSelf: 'flex-start', textTransform: 'none' }}
                >
                    Cartões
                </Button>

                <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={1.5}>
                    <ToggleButtonGroup
                        size="small"
                        value={isAllTime ? 'all' : isCustom ? 'custom' : 'monthly'}
                        exclusive
                        onChange={(_, value) => {
                            if (value !== null) {
                                setIsAllTime(value === 'all');
                                setIsCustom(value === 'custom');
                            }
                        }}
                        sx={{
                            '& .MuiToggleButton-root': {
                                border: `1px solid ${colors.border}`,
                                color: colors.textMuted,
                                fontSize: '12px',
                                fontWeight: 600,
                                textTransform: 'none',
                                px: 2,
                                '&.Mui-selected': {
                                    bgcolor: colors.accent,
                                    color: '#0A0A0F',
                                    '&:hover': { bgcolor: colors.accent },
                                },
                            },
                        }}
                    >
                        <ToggleButton value="monthly">Mensal</ToggleButton>
                        <ToggleButton value="custom">Personalizado</ToggleButton>
                        <ToggleButton value="all">Geral</ToggleButton>
                    </ToggleButtonGroup>

                    {!isCustom ? (
                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={0.5}
                            sx={{
                                bgcolor: colors.bgCard,
                                p: 0.5,
                                borderRadius: '10px',
                                border: `1px solid ${colors.border}`,
                                opacity: isAllTime ? 0.5 : 1,
                                pointerEvents: isAllTime ? 'none' : 'auto',
                            }}
                        >
                            <IconButton size="small" onClick={handlePrevMonth} sx={{ color: colors.textMuted }}>
                                <ChevronLeft size={16} />
                            </IconButton>
                            <Typography sx={{ fontSize: '13px', fontWeight: 600, minWidth: 100, textAlign: 'center', textTransform: 'capitalize', color: colors.textPrimary }}>
                                {format(selectedDate, 'MMM yyyy', { locale: ptBR })}
                            </Typography>
                            <IconButton size="small" onClick={handleNextMonth} sx={{ color: colors.textMuted }}>
                                <ChevronRight size={16} />
                            </IconButton>
                        </Stack>
                    ) : (
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <TextField
                                size="small"
                                type="date"
                                value={customStart}
                                onChange={(e) => setCustomStart(e.target.value)}
                                sx={{ width: 130, '& .MuiInputBase-root': { fontSize: '12px', height: 32, bgcolor: colors.bgCard, borderRadius: '8px' } }}
                            />
                            <Typography sx={{ fontSize: '11px', color: colors.textMuted }}>até</Typography>
                            <TextField
                                size="small"
                                type="date"
                                value={customEnd}
                                onChange={(e) => setCustomEnd(e.target.value)}
                                sx={{ width: 130, '& .MuiInputBase-root': { fontSize: '12px', height: 32, bgcolor: colors.bgCard, borderRadius: '8px' } }}
                            />
                        </Stack>
                    )}
                </Stack>
            </Stack>

            {/* Card Header with Icon */}
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <Box sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    bgcolor: card.color || colors.accent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 16px ${card.color || colors.accent}40`,
                }}>
                    <CardIcon size={24} color="#0A0A0F" />
                </Box>
                <Box>
                    <Typography sx={{ fontSize: '22px', fontWeight: 700, color: colors.textPrimary, fontFamily: 'Plus Jakarta Sans' }}>
                        {card.name}
                    </Typography>
                    <Typography sx={{ fontSize: '13px', color: colors.textMuted }}>
                        Final {card.id.slice(-4)} • Vencimento dia {card.due_day}
                    </Typography>
                </Box>
            </Stack>

            {/* 4 Mini Summary Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 4 }}>
                {/* Fatura Atual */}
                <Box sx={{ bgcolor: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '12px', p: 2 }}>
                    <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
                        <TrendingDown size={14} color={colors.red} />
                        <Typography sx={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: colors.textMuted }}>
                            Limite Utilizado
                        </Typography>
                    </Stack>
                    <Typography sx={{ fontSize: '20px', fontWeight: 700, color: colors.red, fontFamily: 'Plus Jakarta Sans' }}>
                        {formatCurrency(card.usage || 0)}
                    </Typography>
                </Box>

                {/* Limite Total */}
                <Box sx={{ bgcolor: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '12px', p: 2 }}>
                    <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
                        <CardIcon size={14} color={colors.accent} />
                        <Typography sx={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: colors.textMuted }}>
                            Limite Total
                        </Typography>
                    </Stack>
                    <Typography sx={{ fontSize: '20px', fontWeight: 700, color: colors.textPrimary, fontFamily: 'Plus Jakarta Sans' }}>
                        {formatCurrency(card.credit_limit || 0)}
                    </Typography>
                </Box>

                {/* Disponível */}
                <Box sx={{ bgcolor: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '12px', p: 2 }}>
                    <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
                        <Wallet size={14} color={colors.green} />
                        <Typography sx={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: colors.textMuted }}>
                            Disponível
                        </Typography>
                    </Stack>
                    <Typography sx={{ fontSize: '20px', fontWeight: 700, color: colors.green, fontFamily: 'Plus Jakarta Sans' }}>
                        {formatCurrency(card.available_limit || 0)}
                    </Typography>
                </Box>

                {/* Utilização */}
                <Box sx={{ bgcolor: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '12px', p: 2 }}>
                    <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
                        <Percent size={14} color={getUsageColor()} />
                        <Typography sx={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: colors.textMuted }}>
                            Utilização
                        </Typography>
                    </Stack>
                    <Typography sx={{ fontSize: '20px', fontWeight: 700, color: getUsageColor(), fontFamily: 'Plus Jakarta Sans' }}>
                        {usagePercent.toFixed(1)}%
                    </Typography>
                </Box>
            </Box>
        </>
    );
}
