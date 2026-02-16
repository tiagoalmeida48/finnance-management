import { Box, Container, Typography, Stack } from '@mui/material';
import { useDashboardPageLogic } from '../shared/hooks/useDashboardPageLogic';
import { DashboardSummary } from '../shared/components/dashboard/DashboardSummary';
import { DashboardCharts } from '../shared/components/dashboard/DashboardCharts';
import { DashboardRecentTransactions } from '../shared/components/dashboard/DashboardRecentTransactions';
import { DashboardFilters } from '../shared/components/dashboard/DashboardFilters';

export function DashboardPage() {
    const {
        filterType, setFilterType,
        currentDate, setCurrentDate,
        stats, chartData, categories,
        isLoading,
        handlePrevMonth, handleNextMonth
    } = useDashboardPageLogic();

    return (
        <Box sx={{ pt: 4, pb: 6 }}>
            <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} sx={{ mb: 4 }} spacing={2}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, fontSize: { xs: '24px', md: '34px' } }}>Dashboard</Typography>
                        <Typography color="text.secondary">Bem-vindo de volta! Aqui está o resumo das suas finanças.</Typography>
                    </Box>
                    <DashboardFilters
                        filterType={filterType}
                        setFilterType={setFilterType}
                        currentDate={currentDate}
                        setCurrentDate={setCurrentDate}
                        handlePrevMonth={handlePrevMonth}
                        handleNextMonth={handleNextMonth}
                    />
                </Stack>

                <DashboardSummary stats={stats} isLoading={isLoading} />

                <DashboardCharts chartData={chartData} categories={categories} />

                <DashboardRecentTransactions transactions={stats?.transactions} isLoading={isLoading} />
            </Container>
        </Box>
    );
}
