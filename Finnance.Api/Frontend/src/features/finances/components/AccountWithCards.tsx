import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Badge, Button, Card, EntityIcon } from '@/shared/components/ui';
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
    <Card className="flex h-full flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg"
            style={{ backgroundColor: `${account.color}33`, color: account.color }}
          >
            <EntityIcon name={account.icon} size={20} fallback="Wallet" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate font-semibold text-text">{account.name}</p>
              {!account.active && <Badge variant="expense">Inativa</Badge>}
            </div>
            {accountTypeName && <p className="text-sm text-text-muted truncate">{accountTypeName}</p>}
          </div>
        </div>

        <p className="nums shrink-0 text-xl font-semibold text-text">
          {formatCurrency(account.currentBalance)}
        </p>
      </div>

      <div className="flex-1 space-y-2 border-t border-border pt-3">
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
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
        <Button variant="outline" size="sm" onClick={() => onAddCard(account.bankAccount)}>
          <Plus className="h-4 w-4" />
          Adicionar cartão
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto"
          onClick={() => onEditAccount(account)}
        >
          <Pencil className="h-4 w-4" />
          Editar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-expense hover:text-expense hover:brightness-125"
          onClick={() => onDeleteAccount(account)}
        >
          <Trash2 className="h-4 w-4" />
          Excluir
        </Button>
      </div>
    </Card>
  );
}
