import { Stack, Box, Typography, Button, IconButton, ToggleButtonGroup, ToggleButton, TextField } from '@mui/material';
import { ChevronLeft, ChevronRight, CreditCard as CardIcon } from 'lucide-react';
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

export function CardDetailsHeader({
    card, navigate,
    isAllTime, setIsAllTime,
    isCustom, setIsCustom,
    selectedDate, handlePrevMonth, handleNextMonth,
    customStart, setCustomStart,
    customEnd, setCustomEnd
}: CardDetailsHeaderProps) {
    return (
        <>
            <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', lg: 'center' }} sx={{ mb: 4, gap: 2 }}>
                <Button
                    startIcon={<ChevronLeft />}
                    onClick={() => navigate('/cards')}
                    sx={{ color: 'text.secondary', alignSelf: 'flex-start' }}
                >
                    Voltar para Cartões
                </Button>

                <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={2}>
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
                        sx={{ borderColor: '#2A2A2A' }}
                    >
                        <ToggleButton value="monthly" sx={{ px: 2, textTransform: 'none', fontWeight: 600 }}>Mensal</ToggleButton>
                        <ToggleButton value="custom" sx={{ px: 2, textTransform: 'none', fontWeight: 600 }}>Personalizado</ToggleButton>
                        <ToggleButton value="all" sx={{ px: 2, textTransform: 'none', fontWeight: 600 }}>Geral</ToggleButton>
                    </ToggleButtonGroup>

                    {!isCustom ? (
                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                            sx={{
                                bgcolor: 'rgba(255,255,255,0.03)',
                                p: 0.5,
                                borderRadius: 2,
                                border: '1px solid #2A2A2A',
                                opacity: isAllTime ? 0.5 : 1,
                                pointerEvents: isAllTime ? 'none' : 'auto',
                                transition: 'all 0.2s ease',
                                width: { xs: '100%', sm: 'auto' },
                                justifyContent: 'center'
                            }}
                        >
                            <IconButton size="small" onClick={handlePrevMonth} sx={{ color: 'text.secondary' }}>
                                <ChevronLeft size={18} />
                            </IconButton>
                            <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 120, textAlign: 'center', textTransform: 'capitalize' }}>
                                {format(selectedDate, 'MMM yyyy', { locale: ptBR })}
                            </Typography>
                            <IconButton size="small" onClick={handleNextMonth} sx={{ color: 'text.secondary' }}>
                                <ChevronRight size={18} />
                            </IconButton>
                        </Stack>
                    ) : (
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <TextField
                                size="small"
                                type="date"
                                value={customStart}
                                onChange={(e) => setCustomStart(e.target.value)}
                                sx={{ width: 140, '& .MuiInputBase-root': { fontSize: '0.8rem', height: 38 } }}
                            />
                            <Typography variant="caption" sx={{ opacity: 0.5 }}>até</Typography>
                            <TextField
                                size="small"
                                type="date"
                                value={customEnd}
                                onChange={(e) => setCustomEnd(e.target.value)}
                                sx={{ width: 140, '& .MuiInputBase-root': { fontSize: '0.8rem', height: 38 } }}
                            />
                        </Stack>
                    )}
                </Stack>
            </Stack>

            <Stack direction="row" spacing={3} alignItems="flex-start" sx={{ mb: 6 }}>
                <Box sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: card.color || 'primary.main',
                    color: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                }}>
                    <CardIcon size={32} />
                </Box>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>{card.name}</Typography>
                    <Typography color="text.secondary">
                        Final {card.id.slice(-4)} • Vencimento dia {card.due_day}
                    </Typography>
                </Box>
            </Stack>
        </>
    );
}
