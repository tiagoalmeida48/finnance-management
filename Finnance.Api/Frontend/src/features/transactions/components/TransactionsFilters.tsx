import { ChevronLeft, ChevronRight, CreditCard } from 'lucide-react';
import { Input, SegmentedControl, SelectMenu } from '@/shared/components/ui';
import { cn } from '@/shared/utils';
import { TransactionTypeId } from '@/config/constants';
import {
  useAccountsLookup,
  useCardsLookup,
  useCategoriesLookup,
  usePaymentMethodsLookup,
} from '../hooks/useLookups';
import type { TransactionViewMode } from '../hooks/useTransactionsPageLogic';
import type { TransactionFilter } from '../types/transactions.types';

interface TransactionsFiltersProps {
  filter: TransactionFilter;
  viewMode: TransactionViewMode;
  monthLabel: string;
  onChange: (patch: Partial<TransactionFilter>) => void;
  onTypeChange: (type: number) => void;
  onStatusChange: (isPaid: boolean | null) => void;
  onToggleHideCards: () => void;
  onViewChange: (mode: TransactionViewMode) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const typeOptions = [
  { value: String(TransactionTypeId.INCOME), label: 'Receitas' },
  { value: String(TransactionTypeId.EXPENSE), label: 'Despesas' },
  { value: String(TransactionTypeId.TRANSFER), label: 'Transf.' },
];

const statusOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendentes' },
];

const viewOptions = [
  { value: 'month', label: 'Mês' },
  { value: 'general', label: 'Geral' },
  { value: 'installments', label: 'Parcelados' },
];

export function TransactionsFilters({
  filter,
  viewMode,
  monthLabel,
  onChange,
  onTypeChange,
  onStatusChange,
  onToggleHideCards,
  onViewChange,
  onPrevMonth,
  onNextMonth,
}: TransactionsFiltersProps) {
  const accounts = useAccountsLookup();
  const categories = useCategoriesLookup();
  const cards = useCardsLookup();
  const paymentMethods = usePaymentMethodsLookup();

  const accountOptions = [
    { value: '', label: 'Todas' },
    ...(accounts.data ?? []).map((a) => ({ value: a.bankAccount, label: a.name })),
  ];
  const categoryOptions = [
    { value: '', label: 'Todas' },
    ...(categories.data ?? []).map((c) => ({ value: c.category, label: c.name })),
  ];
  const cardOptions = [
    { value: '', label: 'Todos' },
    ...(cards.data ?? []).map((c) => ({ value: c.creditCard, label: c.name })),
  ];
  const paymentMethodOptions = [
    { value: '', label: 'Todos' },
    ...(paymentMethods.data ?? []).map((p) => ({ value: p.paymentMethod, label: p.name })),
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedControl
            value={filter.transactionType ? String(filter.transactionType) : ''}
            options={typeOptions}
            onChange={(value) => onTypeChange(Number(value))}
          />
          <SegmentedControl
            value={filter.isPaid === false ? 'pending' : 'all'}
            options={statusOptions}
            onChange={(value) => onStatusChange(value === 'pending' ? false : null)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleHideCards}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-all',
              filter.hideCreditCards
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-surface-2 text-text-muted hover:text-text',
            )}
          >
            <CreditCard size={14} />
            Ocultar Cartão
          </button>

          <SegmentedControl
            value={viewMode}
            options={viewOptions}
            onChange={(value) => onViewChange(value as TransactionViewMode)}
          />

          {viewMode === 'month' ? (
            <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface-2 p-1">
              <button
                type="button"
                onClick={onPrevMonth}
                aria-label="Mês anterior"
                className="rounded-md p-1 text-text-muted transition-colors hover:bg-surface-3 hover:text-text"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="min-w-[110px] text-center font-mono text-xs uppercase tracking-wider text-text">
                {monthLabel}
              </span>
              <button
                type="button"
                onClick={onNextMonth}
                aria-label="Próximo mês"
                className="rounded-md p-1 text-text-muted transition-colors hover:bg-surface-3 hover:text-text"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Input
          placeholder="Buscar por descrição…"
          value={filter.search}
          onChange={(e) => onChange({ search: e.target.value, offset: 0 })}
        />
        <SelectMenu
          placeholder="Categorias"
          options={categoryOptions}
          value={filter.category || ''}
          onChange={(value) => onChange({ category: Number(value) || 0, offset: 0 })}
        />
        <SelectMenu
          placeholder="Pagamentos"
          options={paymentMethodOptions}
          value={filter.paymentMethod || ''}
          onChange={(value) => onChange({ paymentMethod: Number(value) || 0, offset: 0 })}
        />
        <SelectMenu
          placeholder="Contas"
          options={accountOptions}
          value={filter.account || ''}
          onChange={(value) => onChange({ account: Number(value) || 0, offset: 0 })}
        />
        <SelectMenu
          placeholder="Cartões"
          options={cardOptions}
          value={filter.card || ''}
          onChange={(value) => onChange({ card: Number(value) || 0, offset: 0 })}
        />
      </div>
    </div>
  );
}
