import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button, Spinner } from '@/shared/components/ui';
import { formatCurrency } from '@/shared/utils';
import { useCardInvoices, useRecalculateInvoice } from '../hooks/useCards';
import { InvoiceRow } from './InvoiceRow';
import type { CreditCard } from '../types/cards.types';

interface CardDetailModalProps {
  card: CreditCard | null;
  onClose: () => void;
}

function buildYears(): number[] {
  const current = new Date().getFullYear();
  return [current + 1, current, current - 1, current - 2];
}

export function CardDetailModal({ card, onClose }: CardDetailModalProps) {
  const years = useMemo(() => buildYears(), []);
  const [year, setYear] = useState(() => new Date().getFullYear());
  const cardId = card?.creditCard ?? null;
  const { data: invoices, isLoading } = useCardInvoices(cardId, year);
  const recalculate = useRecalculateInvoice();

  useEffect(() => {
    if (card) setYear(new Date().getFullYear());
  }, [card]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && card) onClose();
    };
    if (card) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [card, onClose]);

  if (!card) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
        <div className="flex items-center justify-between gap-4 border-b border-border p-6">
          <div className="flex items-center gap-3">
            <span
              className="h-8 w-8 rounded-md"
              style={{ backgroundColor: card.color || 'var(--color-primary)' }}
              aria-hidden
            />
            <div>
              <h2 className="text-xl font-bold text-text">{card.name}</h2>
              <p className="text-xs text-text-muted">Limite {formatCurrency(card.creditLimit)}</p>
            </div>
          </div>
          <select
            className="input-base"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            aria-label="Ano das faturas"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-6">
          {isLoading ? (
            <div className="py-10">
              <Spinner />
            </div>
          ) : invoices && invoices.length > 0 ? (
            invoices.map((invoice) => (
              <InvoiceRow
                key={invoice.creditCardInvoice}
                invoice={invoice}
                recalculating={recalculate.isPending && recalculate.variables === invoice.creditCardInvoice}
                onRecalculate={(id) => recalculate.mutate(id)}
              />
            ))
          ) : (
            <p className="py-10 text-center text-text-muted">
              Nenhuma fatura encontrada para {year}.
            </p>
          )}
        </div>

        <div className="flex justify-end border-t border-border p-4">
          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
