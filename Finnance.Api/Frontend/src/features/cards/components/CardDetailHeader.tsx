import { CalendarRange, ChevronLeft, ChevronRight, CreditCard as CardIcon } from 'lucide-react';
import { Button } from '@/shared/components/ui';
import { formatCurrency } from '@/shared/utils';
import { UsageBar } from './UsageBar';
import type { CreditCard, CreditCardStats, StatementCycle } from '../types/cards.types';

interface CardDetailHeaderProps {
  card: CreditCard;
  stats: CreditCardStats | null;
  openCycle: StatementCycle | null;
  isAllTime: boolean;
  year: number;
  onSetAllTime: (value: boolean) => void;
  onPrevYear: () => void;
  onNextYear: () => void;
  onBack: () => void;
  onOpenCycles: () => void;
}

export function CardDetailHeader({
  card,
  stats,
  openCycle,
  isAllTime,
  year,
  onSetAllTime,
  onPrevYear,
  onNextYear,
  onBack,
  onOpenCycles,
}: CardDetailHeaderProps) {
  const limit = stats?.creditLimit ?? card.creditLimit;
  const usage = stats?.usage ?? 0;
  const currentInvoice = stats?.currentInvoice ?? 0;
  const available = stats?.availableLimit ?? limit;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ChevronLeft size={16} className="mr-1" />
          Voltar para cartões
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={onOpenCycles}>
            <CalendarRange size={14} className="mr-1" />
            Ciclo de faturamento
          </Button>

          <div className="inline-flex items-center rounded-md border border-border bg-surface-2 p-1">
            <button
              type="button"
              onClick={() => onSetAllTime(false)}
              className={`rounded px-3 py-1 text-sm font-semibold transition-colors ${
                !isAllTime ? 'bg-primary/20 text-primary' : 'text-text-muted hover:text-text'
              }`}
            >
              Anual
            </button>
            <button
              type="button"
              onClick={() => onSetAllTime(true)}
              className={`rounded px-3 py-1 text-sm font-semibold transition-colors ${
                isAllTime ? 'bg-primary/20 text-primary' : 'text-text-muted hover:text-text'
              }`}
            >
              Tudo
            </button>
          </div>

          <div
            className={`inline-flex items-center gap-1 rounded-md border border-border bg-surface-2 p-1 ${
              isAllTime ? 'pointer-events-none opacity-40' : ''
            }`}
          >
            <button
              type="button"
              onClick={onPrevYear}
              className="rounded p-1 text-text-muted hover:bg-surface hover:text-text"
              aria-label="Ano anterior"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="min-w-[48px] text-center text-sm font-bold text-primary">{year}</span>
            <button
              type="button"
              onClick={onNextYear}
              className="rounded p-1 text-text-muted hover:bg-surface hover:text-text"
              aria-label="Próximo ano"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 rounded-lg border border-border bg-surface p-6">
        <span
          className="flex h-12 w-16 shrink-0 items-center justify-center rounded-md"
          style={{ backgroundColor: card.color || 'var(--color-primary)' }}
        >
          <CardIcon size={22} className="text-white" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-text">{card.name}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-text-muted">
            <span>
              Vencimento <strong className="text-text">{openCycle?.dueDay ?? '—'}</strong>
            </span>
            <span>·</span>
            <span>
              Fechamento <strong className="text-text">{openCycle?.closingDay ?? '—'}</strong>
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Limite" value={formatCurrency(limit)} />
        <MetricCard label="Fatura atual" value={formatCurrency(currentInvoice)} />
        <MetricCard label="Disponível" value={formatCurrency(available)} />
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="text-xs font-semibold tracking-wide text-text-muted">Uso do limite</p>
          <p className="mt-1 text-lg font-bold text-text">{formatCurrency(usage)}</p>
          <div className="mt-3">
            <UsageBar usage={usage} creditLimit={limit} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <p className="text-xs font-semibold tracking-wide text-text-muted">{label}</p>
      <p className="mt-1 text-lg font-bold text-text">{value}</p>
    </div>
  );
}
