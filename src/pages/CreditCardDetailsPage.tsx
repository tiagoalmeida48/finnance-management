import { Box, Container, Typography, CircularProgress } from '@mui/material';
import { useCreditCardDetailsLogic } from '../shared/hooks/useCreditCardDetailsLogic';
import { CardDetailsHeader } from '../shared/components/cards/CardDetailsHeader';
import { CardDetailsCharts } from '../shared/components/cards/CardDetailsCharts';
import { CardStatementList } from '../shared/components/cards/CardStatementList';
import { PayBillModal } from '../shared/components/cards/PayBillModal';

export function CreditCardDetailsPage() {
    const {
        navigate, card, isLoading,
        selectedDate,
        isAllTime, setIsAllTime,
        isCustom, setIsCustom,
        customStart, setCustomStart,
        customEnd, setCustomEnd,
        payModalOpen, setPayModalOpen,
        selectedStatement, setSelectedStatement,
        handlePrevMonth, handleNextMonth,
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
                    isCustom={isCustom}
                    setIsCustom={setIsCustom}
                    selectedDate={selectedDate}
                    handlePrevMonth={handlePrevMonth}
                    handleNextMonth={handleNextMonth}
                    customStart={customStart}
                    setCustomStart={setCustomStart}
                    customEnd={customEnd}
                    setCustomEnd={setCustomEnd}
                />
                <CardDetailsCharts chartData={historyData.chartData} categoryData={historyData.categoryData} />
                <CardStatementList statements={historyData.statements} handleOpenPayModal={handleOpenPayModal} />
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
