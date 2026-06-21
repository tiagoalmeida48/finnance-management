import { Badge, Button, Card } from '@/shared/components/ui';
import { formatCurrency } from '@/shared/utils';
import { UsageBar } from './UsageBar';
import type { CreditCard, CreditCardStats } from '../types/cards.types';

interface CardItemProps {
  card: CreditCard;
  stats: CreditCardStats | undefined;
  onView: (card: CreditCard) => void;
  onEdit: (card: CreditCard) => void;
  onDelete: (card: CreditCard) => void;
}

export function CardItem({ card, stats, onView, onEdit, onDelete }: CardItemProps) {
  const usage = stats?.usage ?? 0;
  const limit = stats?.creditLimit ?? card.creditLimit;
  const available = stats?.availableLimit ?? Math.max(limit - usage, 0);
  const accent = card.color || 'var(--color-primary)';

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <span
            className="h-10 w-10 shrink-0 rounded-md"
            style={{ backgroundColor: accent }}
            aria-hidden
          />
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold text-text">{card.name}</h3>
            <p className="text-xs text-text-muted">Limite {formatCurrency(limit)}</p>
          </div>
        </div>
        {!card.active ? <Badge variant="expense">Inativo</Badge> : null}
      </div>

      <UsageBar usage={usage} creditLimit={limit} />

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-text-muted">Em uso</dt>
          <dd className="font-semibold text-expense">{formatCurrency(usage)}</dd>
        </div>
        <div>
          <dt className="text-text-muted">Disponível</dt>
          <dd className="font-semibold text-income">{formatCurrency(available)}</dd>
        </div>
      </dl>

      <div className="mt-auto flex gap-2 pt-2">
        <Button variant="secondary" size="sm" className="flex-1" onClick={() => onView(card)}>
          Faturas
        </Button>
        <Button variant="outline" size="sm" onClick={() => onEdit(card)}>
          Editar
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(card)}>
          Excluir
        </Button>
      </div>
    </Card>
  );
}
