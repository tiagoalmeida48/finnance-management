import { CalendarRange, ChevronLeft, ChevronRight, CreditCard as CardIcon } from 'lucide-react';
import { Button, SegmentedControl } from '@/shared/components/ui';
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

          <SegmentedControl
            value={isAllTime ? 'all' : 'year'}
            onChange={(value) => onSetAllTime(value === 'all')}
            options={[
              { value: 'year', label: 'Anual' },
              { value: 'all', label: 'Tudo' },
            ]}
          />

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

      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div
          className="relative h-44 w-full max-w-[19rem] shrink-0 overflow-hidden rounded-2xl p-5 shadow-elevated"
          style={{ backgroundColor: card.color || 'var(--color-primary)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/55" />
          <div className="relative flex h-full flex-col justify-between text-white">
            <div className="flex items-start justify-between">
              <span className="mono-label text-[10px] text-white/75">Crédito</span>
              <CardIcon size={22} className="text-white/90" />
            </div>
            <div className="h-7 w-10 rounded-md bg-white/25 ring-1 ring-white/20" />
            <div>
              <p className="nums text-sm tracking-[0.3em] text-white/80">•••• •••• •••• ••••</p>
              <p className="mt-2 font-display text-lg font-semibold leading-none">{card.name}</p>
            </div>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-semibold text-text">{card.name}</h1>
          <div className="mt-4 flex gap-8">
            <div>
              <p className="mono-label text-[10px] text-text-muted">Vencimento</p>
              <p className="nums mt-1 text-text">{openCycle?.dueDay ? `dia ${openCycle.dueDay}` : '—'}</p>
            </div>
            <div>
              <p className="mono-label text-[10px] text-text-muted">Fechamento</p>
              <p className="nums mt-1 text-text">
                {openCycle?.closingDay ? `dia ${openCycle.closingDay}` : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Limite" value={formatCurrency(limit)} />
        <MetricCard label="Fatura atual" value={formatCurrency(currentInvoice)} />
        <MetricCard label="Disponível" value={formatCurrency(available)} />
        <div className="rounded-xl border border-border bg-surface-gradient p-5 shadow-card">
          <p className="mono-label text-[10px] text-text-muted">Uso do limite</p>
          <p className="nums mt-1.5 text-xl font-semibold text-text">{formatCurrency(usage)}</p>
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
    <div className="rounded-xl border border-border bg-surface-gradient p-5 shadow-card">
      <p className="mono-label text-[10px] text-text-muted">{label}</p>
      <p className="nums mt-1.5 text-xl font-semibold text-text">{value}</p>
    </div>
  );
}
