import { useState } from 'react';
import { useCreditCardDetailsLogic } from '@/pages/cards/hooks/useCreditCardDetailsLogic';
import { CardDetailsHeader } from './components/headers/CardDetailsHeader';
import { CardDetailsCharts } from './components/charts/CardDetailsCharts';
import { CardStatementList } from './components/lists/CardStatementList';
import { CardStatementCycleHistoryModal } from './components/lists/CardStatementCycleHistory';
import { PayBillModal } from './components/modals/PayBillModal';
import { TransactionFormModal } from '@/pages/transactions/components/modals/TransactionFormModal';
import type { Transaction } from '@/shared/interfaces';
import { Container } from '@/shared/components/layout/Container';
import { Section } from '@/shared/components/layout/Section';
import { messages } from '@/shared/i18n/messages';

export function CreditCardDetailsPage() {
    const detailsMessages = messages.cards.detailsPage;
    const [cycleHistoryOpen, setCycleHistoryOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

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
            <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[var(--color-primary)]" />
            </div>
        );
    }

    if (!card) return <p>{detailsMessages.notFound}</p>;

    return (
        <Section>
            <Container>
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
                    onEditTransaction={(transaction) => setEditingTransaction(transaction as Transaction)}
                />
                <TransactionFormModal
                    open={!!editingTransaction}
                    onClose={() => setEditingTransaction(null)}
                    transaction={editingTransaction ?? undefined}
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
        </Section>
    );
}
