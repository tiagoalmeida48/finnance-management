import { Box, Container, Typography, Stack, Grid, IconButton, CircularProgress } from '@mui/material';
import { CalendarCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths } from 'date-fns';
import { useBillTrackingPageLogic } from '../shared/hooks/useBillTrackingPageLogic';
import { MonthlyTrackingCard } from '../shared/components/tracking/MonthlyTrackingCard';

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
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                    <Box>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                            <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'rgba(212, 175, 55, 0.1)', color: 'primary.main', display: 'flex' }}>
                                <CalendarCheck size={24} />
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>Tracking de Contas</Typography>
                        </Stack>
                        <Typography color="text.secondary">Acompanhamento mensal de despesas fixas e faturas.</Typography>
                    </Box>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ bgcolor: 'rgba(255,255,255,0.02)', p: 1, borderRadius: 2, border: '1px solid rgba(255,255,255,0.05)' }}>
                        <IconButton onClick={() => setCurrentYear(prev => addMonths(prev, -12))}>
                            <ChevronLeft size={20} />
                        </IconButton>
                        <Typography sx={{ fontWeight: 700, minWidth: 60, textAlign: 'center' }}>
                            {format(currentYear, 'yyyy')}
                        </Typography>
                        <IconButton onClick={() => setCurrentYear(prev => addMonths(prev, 12))}>
                            <ChevronRight size={20} />
                        </IconButton>
                    </Stack>
                </Stack>

                <Grid container spacing={3}>
                    {monthlyData.map((data, idx) => (
                        <MonthlyTrackingCard key={idx} data={data} />
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}
