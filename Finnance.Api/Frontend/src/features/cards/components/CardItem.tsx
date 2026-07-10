import { Pencil, Power, Trash2 } from 'lucide-react';
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
  onToggleActive: (card: CreditCard) => void;
}

export function CardItem({ card, stats, onView, onEdit, onDelete, onToggleActive }: CardItemProps) {
  const usage = stats?.usage ?? 0;
  const limit = stats?.creditLimit ?? card.creditLimit;
  const available = stats?.availableLimit ?? Math.max(limit - usage, 0);
  const accent = card.color || 'var(--color-primary)';

  return (
    <Card className="flex flex-col gap-3 transition-colors hover:border-primary/40">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <span
            className="h-10 w-10 shrink-0 rounded-md"
            style={{ backgroundColor: accent }}
            aria-hidden
          />
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold text-text">{card.name}</h3>
            <p className="text-xs text-text-muted">
              Limite <span className="nums text-text">{formatCurrency(limit)}</span>
            </p>
          </div>
        </div>
        <Badge variant={card.active ? 'income' : 'expense'}>
          {card.active ? 'Ativo' : 'Inativo'}
        </Badge>
      </div>

      <UsageBar usage={usage} creditLimit={limit} />

      <dl className="grid grid-cols-2 gap-3">
        <div>
          <dt className="mono-label text-[10px] text-text-muted">Em uso</dt>
          <dd className="nums mt-0.5 font-semibold text-expense">{formatCurrency(usage)}</dd>
        </div>
        <div>
          <dt className="mono-label text-[10px] text-text-muted">Disponível</dt>
          <dd className="nums mt-0.5 font-semibold text-income">{formatCurrency(available)}</dd>
        </div>
      </dl>

      <div className="mt-auto flex items-center gap-2 pt-2">
        <Button variant="secondary" size="sm" className="flex-1" onClick={() => onView(card)}>
          Faturas
        </Button>
        <Button
          variant="ghost"
          size="sm"
          aria-label={card.active ? 'Desativar cartão' : 'Ativar cartão'}
          title={card.active ? 'Desativar' : 'Ativar'}
          onClick={() => onToggleActive(card)}
        >
          <Power className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Editar cartão"
          onClick={() => onEdit(card)}
        >
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
    </Card>
  );
}
