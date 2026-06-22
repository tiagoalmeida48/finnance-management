import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  Select,
  Spinner,
} from '@/shared/components/ui';
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

  return (
    <Dialog open={Boolean(card)} onOpenChange={(open) => !open && onClose()} className="max-w-2xl">
      <DialogContent className="p-0">
        <DialogHeader className="mb-0 flex items-center justify-between gap-4 p-6">
          <div className="flex items-center gap-3">
            <span
              className="h-8 w-8 rounded-md"
              style={{ backgroundColor: card?.color || 'var(--color-primary)' }}
              aria-hidden
            />
            <div>
              <h2 className="text-xl font-bold text-text">{card?.name}</h2>
              <p className="text-xs text-text-muted">
                Limite {formatCurrency(card?.creditLimit ?? 0)}
              </p>
            </div>
          </div>
          <Select
            className="w-28"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            aria-label="Ano das faturas"
            options={years.map((y) => ({ value: y, label: String(y) }))}
          />
        </DialogHeader>

        <div className="max-h-[60vh] space-y-3 overflow-y-auto p-6">
          {isLoading ? (
            <div className="py-10">
              <Spinner />
            </div>
          ) : invoices && invoices.length > 0 ? (
            invoices.map((invoice) => (
              <InvoiceRow
                key={invoice.creditCardInvoice}
                invoice={invoice}
                recalculating={
                  recalculate.isPending && recalculate.variables === invoice.creditCardInvoice
                }
                onRecalculate={(id) => recalculate.mutate(id)}
              />
            ))
          ) : (
            <p className="py-10 text-center text-text-muted">
              Nenhuma fatura encontrada para {year}.
            </p>
          )}
        </div>

        <DialogFooter className="mt-0 p-4">
          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
