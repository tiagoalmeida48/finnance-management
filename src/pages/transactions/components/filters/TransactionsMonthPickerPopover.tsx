import { IconButton } from '@/shared/components/ui/icon-button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApplyElementStyles } from '@/shared/hooks/useApplyElementStyles';
import { messages } from '@/shared/i18n/messages';
import { Container } from '@/shared/components/layout/Container';
import { Text } from '@/shared/components/ui/Text';
import { Button } from '@/shared/components/ui/button';

const months = messages.transactions.filters.monthsShort;

interface TransactionsMonthPickerPopoverProps {
    open: boolean;
    monthAnchor: HTMLElement | null;
    setMonthAnchor: (anchor: HTMLElement | null) => void;
    pickerYear: number;
    setPickerYear: React.Dispatch<React.SetStateAction<number>>;
    currentMonth: Date;
    onSelectMonth: (monthIndex: number) => void;
}

export function TransactionsMonthPickerPopover({
    open,
    monthAnchor,
    setMonthAnchor,
    pickerYear,
    setPickerYear,
    currentMonth,
    onSelectMonth,
}: TransactionsMonthPickerPopoverProps) {
    const anchorRect = monthAnchor?.getBoundingClientRect();
    const popoverPositionRef = useApplyElementStyles<HTMLDivElement>({
        top: anchorRect ? `${anchorRect.bottom + 8}px` : undefined,
        left: anchorRect ? `${anchorRect.left + anchorRect.width / 2 - 140}px` : undefined,
    });

    if (!open || !anchorRect) return null;

    return (
        <>
            <Container unstyled className="fixed inset-0 z-[1199]" onClick={() => setMonthAnchor(null)} />
            <Container unstyled
                ref={popoverPositionRef}
                className="fixed z-[1200] w-[280px] rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-2"
            >
                <Container unstyled className="mb-1.5 flex items-center justify-between">
                    <IconButton
                        size="small"
                        onClick={() => setPickerYear(y => y - 1)}
                        className="h-7 w-7 rounded-[7px] text-[var(--color-text-secondary)] hover:bg-white/5"
                    >
                        <ChevronLeft size={15} />
                    </IconButton>
                    <Text className="text-sm font-bold text-[var(--color-text-primary)] [font-family:var(--font-heading)]">
                        {pickerYear}
                    </Text>
                    <IconButton
                        size="small"
                        onClick={() => setPickerYear(y => y + 1)}
                        className="h-7 w-7 rounded-[7px] text-[var(--color-text-secondary)] hover:bg-white/5"
                    >
                        <ChevronRight size={15} />
                    </IconButton>
                </Container>

                <Container unstyled className="grid grid-cols-4 gap-0.5">
                    {months.map((monthLabel, index) => {
                        const isCurrentMonth = currentMonth.getMonth() === index && currentMonth.getFullYear() === pickerYear;
                        const isToday = new Date().getMonth() === index && new Date().getFullYear() === pickerYear;

                        return (
                            <Button
                                key={monthLabel}
                                onClick={() => onSelectMonth(index)}
                                className={`rounded-lg border px-0.5 py-1 text-xs transition-all duration-150 ${isCurrentMonth
                                        ? 'bg-[var(--color-primary)] font-semibold text-[var(--color-background)]'
                                        : 'bg-transparent font-medium text-[var(--color-text-secondary)]'
                                    } ${isToday && !isCurrentMonth ? 'border-[var(--color-border)]' : 'border-transparent'}`}
                            >
                                {monthLabel}
                            </Button>
                        );
                    })}
                </Container>
            </Container>
        </>
    );
}



