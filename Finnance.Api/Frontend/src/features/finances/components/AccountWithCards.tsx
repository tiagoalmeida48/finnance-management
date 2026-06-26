import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Badge, Button, Card } from '@/shared/components/ui';
import { formatCurrency } from '@/shared/utils';
import { CardRow } from '@/features/cards';
import type { BankAccount } from '@/features/accounts';
import type { CreditCard, CreditCardStats } from '@/features/cards';

interface AccountWithCardsProps {
  account: BankAccount;
  accountTypeName?: string;
  cards: CreditCard[];
  statsByCard: Map<number, CreditCardStats>;
  onEditAccount: (account: BankAccount) => void;
  onDeleteAccount: (account: BankAccount) => void;
  onAddCard: (bankAccount: number) => void;
  onViewCard: (card: CreditCard) => void;
  onEditCard: (card: CreditCard) => void;
  onDeleteCard: (card: CreditCard) => void;
}

export function AccountWithCards({
  account,
  accountTypeName,
  cards,
  statsByCard,
  onEditAccount,
  onDeleteAccount,
  onAddCard,
  onViewCard,
  onEditCard,
  onDeleteCard,
}: AccountWithCardsProps) {
  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg text-xl leading-none"
            style={{ backgroundColor: `${account.color}33` }}
          >
            <span>{account.icon || '🏦'}</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate font-semibold text-text">{account.name}</p>
              {!account.active && <Badge variant="expense">Inativa</Badge>}
            </div>
            {accountTypeName && <p className="text-sm text-text-muted truncate">{accountTypeName}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <p className="nums text-xl font-semibold text-text">
            {formatCurrency(account.currentBalance)}
          </p>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Editar conta"
            onClick={() => onEditAccount(account)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Excluir conta"
            className="text-expense hover:text-expense hover:brightness-125"
            onClick={() => onDeleteAccount(account)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2 border-t border-border pt-3">
        {cards.length === 0 ? (
          <p className="text-sm text-text-muted">Nenhum cartão vinculado a esta conta.</p>
        ) : (
          cards.map((card) => (
            <CardRow
              key={card.creditCard}
              card={card}
              stats={statsByCard.get(card.creditCard)}
              onView={onViewCard}
              onEdit={onEditCard}
              onDelete={onDeleteCard}
            />
          ))
        )}

        <Button
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
          onClick={() => onAddCard(account.bankAccount)}
        >
          <Plus className="h-4 w-4" />
          Adicionar cartão
        </Button>
      </div>
    </Card>
  );
}
