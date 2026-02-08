import { Box, Container, Typography, Stack, Grid, IconButton, CircularProgress } from '@mui/material';
import { CalendarCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths } from 'date-fns';
import { useBillTrackingPageLogic } from '../shared/hooks/useBillTrackingPageLogic';
import { MonthlyTrackingCard } from '../shared/components/tracking/MonthlyTrackingCard';
import { colors } from '@/shared/theme';

export function BillTrackingPage() {
    const {
        currentYear, setCurrentYear,
        loadingTx, loadingCards,
        monthlyData
    } = useBillTrackingPageLogic();

    if (loadingTx || loadingCards) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    return (
        <Box sx={{ pt: 4, pb: 6 }}>
            <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} sx={{ mb: 3 }} spacing={2}>
                    <Box>
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.75 }}>
                            <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: colors.accentGlow, color: 'primary.main', display: 'flex' }}>
                                <CalendarCheck size={22} />
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>Tracking de Contas</Typography>
                        </Stack>
                        <Typography color="text.secondary">Acompanhamento mensal de despesas fixas e faturas.</Typography>
                    </Box>

                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={2}
                        sx={{
                            bgcolor: 'rgba(255,255,255,0.02)',
                            p: 0.8,
                            borderRadius: '999px',
                            border: `1px solid ${colors.border}`,
                        }}
                    >
                        <IconButton size="small" onClick={() => setCurrentYear(prev => addMonths(prev, -12))} sx={{ color: colors.textSecondary }}>
                            <ChevronLeft size={18} />
                        </IconButton>
                        <Typography sx={{ fontWeight: 700, minWidth: 62, textAlign: 'center', fontFamily: '"Plus Jakarta Sans"' }}>
                            {format(currentYear, 'yyyy')}
                        </Typography>
                        <IconButton size="small" onClick={() => setCurrentYear(prev => addMonths(prev, 12))} sx={{ color: colors.textSecondary }}>
                            <ChevronRight size={18} />
                        </IconButton>
                    </Stack>
                </Stack>

                <Grid container spacing={2.25}>
                    {monthlyData.map((data, idx) => (
                        <MonthlyTrackingCard key={idx} data={data} />
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}
