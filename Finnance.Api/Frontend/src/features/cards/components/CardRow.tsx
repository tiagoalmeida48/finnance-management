import { CreditCard as CreditCardIcon, Pencil, Trash2 } from 'lucide-react';
import { Badge, Button } from '@/shared/components/ui';
import { formatCurrency } from '@/shared/utils';
import type { CreditCard, CreditCardStats } from '../types/cards.types';

interface CardRowProps {
  card: CreditCard;
  stats?: CreditCardStats;
  onView: (card: CreditCard) => void;
  onEdit: (card: CreditCard) => void;
  onDelete: (card: CreditCard) => void;
}

export function CardRow({ card, stats, onView, onEdit, onDelete }: CardRowProps) {
  const usage = stats?.usage ?? 0;
  const limit = stats?.creditLimit ?? card.creditLimit;
  const available = stats?.availableLimit ?? Math.max(limit - usage, 0);
  const accent = card.color || 'var(--color-primary)';

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface-2/40 px-3 py-2">
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: `${accent}33` }}
      >
        <CreditCardIcon className="h-4 w-4" style={{ color: accent }} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium text-text">{card.name}</p>
          {!card.active && <Badge variant="expense">Inativo</Badge>}
        </div>
        <p className="text-xs text-text-muted">
          Limite <span className="nums text-text">{formatCurrency(limit)}</span> · usado{' '}
          <span className="nums text-expense">{formatCurrency(usage)}</span> · disponível{' '}
          <span className="nums text-income">{formatCurrency(available)}</span>
        </p>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="secondary" size="sm" onClick={() => onView(card)}>
          Faturas
        </Button>
        <Button variant="ghost" size="sm" aria-label="Editar cartão" onClick={() => onEdit(card)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Excluir cartão"
          className="text-expense hover:text-expense hover:brightness-125"
          onClick={() => onDelete(card)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
