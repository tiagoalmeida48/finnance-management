import { Pencil, Power, Trash2 } from 'lucide-react';
import { Badge, Button, Card, EntityIcon } from '@/shared/components/ui';
import { formatCurrency } from '@/shared/utils';
import type { AccountType, BankAccount } from '../types/accounts.types';

interface AccountCardProps {
  account: BankAccount;
  accountTypeName?: AccountType['name'];
  onEdit: (account: BankAccount) => void;
  onDelete: (account: BankAccount) => void;
  onToggleActive: (account: BankAccount) => void;
}

export function AccountCard({
  account,
  accountTypeName,
  onEdit,
  onDelete,
  onToggleActive,
}: AccountCardProps) {
  return (
    <Card className="flex flex-col gap-3 transition-colors hover:border-primary/40">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="h-11 w-11 shrink-0 rounded-lg flex items-center justify-center overflow-hidden"
            style={{ backgroundColor: `${account.color}33`, color: account.color }}
          >
            <EntityIcon name={account.icon} size={20} fallback="Wallet" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-text truncate">{account.name}</p>
            {accountTypeName && <p className="text-sm text-text-muted truncate">{accountTypeName}</p>}
          </div>
        </div>
        <Badge variant={account.active ? 'income' : 'expense'}>
          {account.active ? 'Ativa' : 'Inativa'}
        </Badge>
      </div>

      <div>
        <p className="mono-label text-[10px] text-text-muted">Saldo atual</p>
        <p className="nums mt-1 text-2xl font-semibold text-text">
          {formatCurrency(account.currentBalance)}
        </p>
      </div>

      {account.notes && <p className="text-sm text-text-muted line-clamp-2">{account.notes}</p>}

      <div className="flex gap-2 justify-end mt-auto pt-2">
        <Button
          variant="ghost"
          size="sm"
          aria-label={account.active ? 'Desativar conta' : 'Ativar conta'}
          title={account.active ? 'Desativar' : 'Ativar'}
          onClick={() => onToggleActive(account)}
        >
          <Power className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Editar conta"
          onClick={() => onEdit(account)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Excluir conta"
          className="text-expense hover:text-expense hover:brightness-125"
          onClick={() => onDelete(account)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
