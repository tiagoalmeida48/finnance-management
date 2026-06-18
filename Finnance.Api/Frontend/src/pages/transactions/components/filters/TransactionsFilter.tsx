import { useState } from 'react';
import { IconButton } from '@/shared/components/ui/icon-button';
import { ChevronLeft, ChevronRight, CreditCard } from 'lucide-react';
import { TransactionsMonthPickerPopover } from './TransactionsMonthPickerPopover';
import { messages } from '@/shared/i18n/messages';
import { Container } from '@/shared/components/layout/Container';
import { Text } from '@/shared/components/ui/Text';
import { Button } from '@/shared/components/ui/button';

interface TransactionsFilterProps {
  typeFilter: string | null;
  setTypeFilter: (val: string | null) => void;
  showPendingOnly: boolean;
  setShowPendingOnly: (val: boolean) => void;
  showAllTime: boolean;
  setShowAllTime: (val: boolean) => void;
  showInstallmentsOnly: boolean;
  setShowInstallmentsOnly: (val: boolean) => void;
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  hideCreditCards: boolean;
  setHideCreditCards: (val: boolean) => void;
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
}

const monthsFull = messages.transactions.filters.monthsFull;

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <Button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all duration-200 border ${
        active
          ? 'border-white/10 bg-white/10 text-white shadow-md'
          : 'border-transparent bg-transparent text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-white'
      }`}
    >
      {children}
    </Button>
  );
}

export function TransactionsFilter({
  typeFilter,
  setTypeFilter,
  showPendingOnly,
  setShowPendingOnly,
  showAllTime,
  setShowAllTime,
  showInstallmentsOnly,
  setShowInstallmentsOnly,
  currentMonth,
  setCurrentMonth,
  hideCreditCards,
  setHideCreditCards,
  handlePrevMonth,
  handleNextMonth,
}: TransactionsFilterProps) {
  const [monthAnchor, setMonthAnchor] = useState<HTMLElement | null>(null);
  const [pickerYear, setPickerYear] = useState(currentMonth.getFullYear());

  const handleSelectMonthlyView = () => {
    setShowInstallmentsOnly(false);
    setShowAllTime(false);
  };

  const handleSelectGeneralView = () => {
    setMonthAnchor(null);
    setShowInstallmentsOnly(false);
    setShowAllTime(true);
  };

  const handleSelectInstallmentsView = () => {
    setMonthAnchor(null);
    setShowInstallmentsOnly(true);
    setShowAllTime(true);
  };

  const handleOpenMonthPicker = (e: React.MouseEvent<HTMLElement>) => {
    setPickerYear(currentMonth.getFullYear());
    setMonthAnchor(e.currentTarget);
  };

  const handleSelectMonth = (monthIndex: number) => {
    setCurrentMonth(new Date(pickerYear, monthIndex, 1));
    setMonthAnchor(null);
  };

  return (
    <Container
      unstyled
      className="mb-4 flex flex-col justify-between gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bgSecondary)]/95 p-2 shadow-lg shadow-black/40 backdrop-blur-md md:flex-row md:items-center md:gap-3 z-10"
    >
      <Container
        unstyled
        className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-webkit-overflow-scrolling:touch] md:pb-0"
      >
        <Container unstyled className="flex shrink-0 gap-1 rounded-xl bg-black/40 p-1">
          <TabButton
            active={typeFilter === 'income'}
            onClick={() => setTypeFilter(typeFilter === 'income' ? null : 'income')}
          >
            {messages.transactions.filters.typeIncome}
          </TabButton>
          <TabButton
            active={typeFilter === 'expense'}
            onClick={() => setTypeFilter(typeFilter === 'expense' ? null : 'expense')}
          >
            {messages.transactions.filters.typeExpense}
          </TabButton>
          <TabButton
            active={typeFilter === 'transfer'}
            onClick={() => setTypeFilter(typeFilter === 'transfer' ? null : 'transfer')}
          >
            {messages.transactions.filters.typeTransferShort}
          </TabButton>
        </Container>

        <Container unstyled className="flex shrink-0 gap-1 rounded-xl bg-black/40 p-1">
          <TabButton active={!showPendingOnly} onClick={() => setShowPendingOnly(false)}>
            {messages.transactions.filters.statusAll}
          </TabButton>
          <TabButton active={showPendingOnly} onClick={() => setShowPendingOnly(true)}>
            {messages.transactions.filters.statusPending}
          </TabButton>
        </Container>
      </Container>

      <Container
        unstyled
        className="flex items-center justify-between gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-webkit-overflow-scrolling:touch] md:justify-end md:pb-0"
      >
        <Button
          type="button"
          onClick={() => setHideCreditCards(!hideCreditCards)}
          className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-1.5 transition-all duration-200 ${
            hideCreditCards
              ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
              : 'border-transparent bg-black/40 text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-white'
          }`}
        >
          <CreditCard
            size={14}
            className={
              hideCreditCards ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'
            }
          />
          <Text as="span" className="whitespace-nowrap text-[13px] font-medium">
            {hideCreditCards
              ? messages.transactions.filters.showCreditCard
              : messages.transactions.filters.hideCreditCard}
          </Text>
        </Button>

        <Container unstyled className="flex shrink-0 gap-2">
          <Container unstyled className="flex gap-1 rounded-xl bg-black/40 p-1">
            <TabButton
              active={!showAllTime && !showInstallmentsOnly}
              onClick={handleSelectMonthlyView}
            >
              {messages.transactions.filters.monthView}
            </TabButton>
            <TabButton
              active={showAllTime && !showInstallmentsOnly}
              onClick={handleSelectGeneralView}
            >
              {messages.transactions.filters.generalView}
            </TabButton>
            <TabButton active={showInstallmentsOnly} onClick={handleSelectInstallmentsView}>
              {messages.transactions.filters.installmentsView}
            </TabButton>
          </Container>

          {!showAllTime && !showInstallmentsOnly && (
            <Container unstyled className="flex items-center gap-1 rounded-xl bg-black/40 p-1">
              <IconButton
                size="small"
                onClick={handlePrevMonth}
                className="h-8 w-8 rounded-lg text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-white"
              >
                <ChevronLeft size={16} />
              </IconButton>
              <Text
                onClick={handleOpenMonthPicker}
                className="font-heading min-w-[120px] cursor-pointer rounded-lg px-2 py-1.5 text-center text-[13px] font-semibold text-[var(--color-text-primary)] hover:bg-white/5"
              >
                {monthsFull[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </Text>
              <IconButton
                size="small"
                onClick={handleNextMonth}
                className="h-8 w-8 rounded-lg text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-white"
              >
                <ChevronRight size={16} />
              </IconButton>
            </Container>
          )}
        </Container>

        <TransactionsMonthPickerPopover
          open={!showAllTime && !showInstallmentsOnly && Boolean(monthAnchor)}
          monthAnchor={monthAnchor}
          setMonthAnchor={setMonthAnchor}
          pickerYear={pickerYear}
          setPickerYear={setPickerYear}
          currentMonth={currentMonth}
          onSelectMonth={handleSelectMonth}
        />
      </Container>
    </Container>
  );
}
