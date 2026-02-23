import { CalendarDays, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { messages } from '@/shared/i18n/messages';
import { transactionsPageStyles } from '../../TransactionsPage.styles';
import { Container } from '@/shared/components/layout/Container';
import { Text } from '@/shared/components/ui/Text';

interface TransactionsBulkActionsBarProps {
    selectedCount: number;
    onBatchPay: () => void;
    onBatchUnpay: () => void;
    onBatchChangeDay: () => void;
    onBatchDelete: () => void;
}

export function TransactionsBulkActionsBar({
    selectedCount,
    onBatchPay,
    onBatchUnpay,
    onBatchChangeDay,
    onBatchDelete,
}: TransactionsBulkActionsBarProps) {
    if (selectedCount === 0) return null;
    const bulkMessages = messages.transactions.bulkActions;

    return (
        <Container unstyled className={transactionsPageStyles.batchBar}>
            <Container unstyled className={transactionsPageStyles.batchBarInner}>
                <Text className={transactionsPageStyles.batchBarText}>
                    {bulkMessages.selectedLabel(selectedCount)}
                </Text>

                <Button
                    size="small"
                    className="border-none bg-[var(--color-success)] text-white hover:bg-[var(--color-success)] hover:brightness-75"
                    startIcon={<CheckCircle2 size={14} />}
                    onClick={onBatchPay}
                >
                    {bulkMessages.markPaid}
                </Button>
                <Button
                    size="small"
                    className="border-none bg-[var(--color-warning)] text-[#111] hover:bg-[var(--color-warning)] hover:brightness-75"
                    startIcon={<Clock size={14} />}
                    onClick={onBatchUnpay}
                >
                    {bulkMessages.markPending}
                </Button>
                <Button size="small" variant="outlined" startIcon={<CalendarDays size={14} />} onClick={onBatchChangeDay}>
                    {bulkMessages.changeDay}
                </Button>
                <Button
                    size="small"
                    className="border-none bg-[var(--color-error)] text-white hover:bg-[var(--color-error)] hover:brightness-75"
                    startIcon={<Trash2 size={14} />}
                    onClick={onBatchDelete}
                >
                    {bulkMessages.delete}
                </Button>
            </Container>
        </Container>
    );
}


