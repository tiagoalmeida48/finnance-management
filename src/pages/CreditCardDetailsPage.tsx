import { useState } from 'react';
import { Box, Container, Typography, CircularProgress } from '@mui/material';
import { useCreditCardDetailsLogic } from '../shared/hooks/useCreditCardDetailsLogic';
import { CardDetailsHeader } from '../shared/components/cards/CardDetailsHeader';
import { CardDetailsCharts } from '../shared/components/cards/CardDetailsCharts';
import { CardStatementList } from '../shared/components/cards/CardStatementList';
import { CardStatementCycleHistoryModal } from '../shared/components/cards/CardStatementCycleHistory';
import { PayBillModal } from '../shared/components/cards/PayBillModal';

export function CreditCardDetailsPage() {
    const [cycleHistoryOpen, setCycleHistoryOpen] = useState(false);

    const {
        navigate, card, isLoading,
        selectedDate,
        isAllTime, setIsAllTime,
        payModalOpen, setPayModalOpen,
        selectedStatement, setSelectedStatement,
        handlePrevYear, handleNextYear,
        handleOpenPayModal, historyData
    } = useCreditCardDetailsLogic();

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    if (!card) return <Typography>Cartão não encontrado.</Typography>;

    return (
        <Box sx={{ pt: 4, pb: 6 }}>
            <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
                <CardDetailsHeader
                    card={card}
                    navigate={navigate}
                    isAllTime={isAllTime}
                    setIsAllTime={setIsAllTime}
                    selectedDate={selectedDate}
                    handlePrevYear={handlePrevYear}
                    handleNextYear={handleNextYear}
                    onOpenStatementCycleHistory={() => setCycleHistoryOpen(true)}
                />
                <CardStatementCycleHistoryModal
                    cardId={card.id}
                    cardName={card.name}
                    fallbackClosingDay={card.current_statement_cycle?.closing_day ?? card.closing_day}
                    fallbackDueDay={card.current_statement_cycle?.due_day ?? card.due_day}
                    open={cycleHistoryOpen}
                    onClose={() => setCycleHistoryOpen(false)}
                />
                <CardDetailsCharts chartData={historyData.chartData} categoryData={historyData.categoryData} />
                <CardStatementList
                    cardId={card.id}
                    statements={historyData.statements}
                    handleOpenPayModal={handleOpenPayModal}
                />
                {selectedStatement && (
                    <PayBillModal
                        open={payModalOpen}
                        onClose={() => {
                            setPayModalOpen(false);
                            setSelectedStatement(null);
                        }}
                        cardId={card.id}
                        cardName={card.name}
                        statementMonth={selectedStatement.month}
                        transactionIds={selectedStatement.unpaidIds}
                        totalAmount={selectedStatement.unpaidTotal}
                    />
                )}
            </Container>
        </Box>
    );
}
