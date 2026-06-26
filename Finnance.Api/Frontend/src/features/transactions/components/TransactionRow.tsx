import { CheckCircle2, Circle, Clock, Copy, CreditCard, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/shared/components/ui';
import { formatCurrency, formatDate } from '@/shared/utils';
import { TransactionTypeId } from '@/config/constants';
import { transactionTypeBadge, transactionTypeLabel } from './transactionMeta';
import type {
  BankAccountLookup,
  CategoryLookup,
  CreditCardLookup,
  Transaction,
} from '../types/transactions.types';

interface TransactionRowProps {
  transaction: Transaction;
  selected: boolean;
  isChild?: boolean;
  accounts: BankAccountLookup[];
  categories: CategoryLookup[];
  cards: CreditCardLookup[];
  onToggleSelect: (id: number) => void;
  onTogglePaid: (transaction: Transaction) => void;
  onEdit: (transaction: Transaction) => void;
  onDuplicate: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

function installmentLabel(transaction: Transaction, isChild: boolean): string | null {
  if (!transaction.installmentNumber) return null;
  if (isChild && transaction.totalInstallments) {
    return `${transaction.installmentNumber}/${transaction.totalInstallments}`;
  }
  return `${transaction.installmentNumber}ª parcela`;
}

function findName<T>(items: T[], idKey: keyof T, nameKey: keyof T, id: number | null): string {
  if (!id) return '—';
  const match = items.find((item) => Number(item[idKey]) === id);
  return match ? String(match[nameKey]) : '—';
}

export function TransactionRow({
  transaction,
  selected,
  isChild = false,
  accounts,
  categories,
  cards,
  onToggleSelect,
  onTogglePaid,
  onEdit,
  onDuplicate,
  onDelete,
}: TransactionRowProps) {
  const isTransfer = transaction.transactionType === TransactionTypeId.TRANSFER;
  const isCard = Boolean(transaction.card);
  const date = transaction.paymentDate ?? transaction.purchaseDate;
  const source = isCard
    ? findName(cards, 'creditCard', 'name', transaction.card)
    : findName(accounts, 'bankAccount', 'name', transaction.account);
  const target = isTransfer
    ? findName(accounts, 'bankAccount', 'name', transaction.toAccount)
    : findName(categories, 'category', 'name', transaction.category);
  const amountColor = isTransfer
    ? 'text-transfer'
    : transaction.transactionType === TransactionTypeId.INCOME
      ? 'text-income'
      : 'text-expense';

  const rowBackground = selected ? 'bg-primary/5' : isChild ? 'bg-surface-2/40' : 'hover:bg-surface-2';

  return (
    <tr className={`border-b border-border transition-colors ${rowBackground}`}>
      <td className={`px-3 py-3 ${isChild ? 'pl-8' : ''}`}>
        <button
          type="button"
          onClick={() => onToggleSelect(transaction.transaction)}
          className={selected ? 'text-primary' : 'text-text-muted hover:text-text'}
          aria-label="Selecionar lançamento"
        >
          {selected ? <CheckCircle2 size={18} /> : <Circle size={18} />}
        </button>
      </td>
      <td className="px-3 py-3">
        <button
          type="button"
          onClick={() => onTogglePaid(transaction)}
          disabled={isCard}
          className={transaction.paid ? 'text-income' : 'text-text-muted hover:text-text'}
          aria-label={transaction.paid ? 'Marcar como pendente' : 'Marcar como pago'}
        >
          {isCard ? <CreditCard size={18} /> : transaction.paid ? <CheckCircle2 size={18} /> : <Clock size={18} />}
        </button>
      </td>
      <td className="nums px-3 py-3 text-xs text-text-muted whitespace-nowrap">
        {date ? formatDate(`${date.slice(0, 10)}T12:00:00`) : '—'}
      </td>
      <td className="px-3 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-sm font-medium ${transaction.paid ? 'text-text' : 'text-text-muted'}`}>
            {transaction.description}
          </span>
          {installmentLabel(transaction, isChild) ? (
            <Badge variant="primary">{installmentLabel(transaction, isChild)}</Badge>
          ) : null}
          {transaction.fixed ? <Badge variant="primary">Recorrente</Badge> : null}
          {!transaction.paid ? <Badge variant="expense">Pendente</Badge> : null}
        </div>
      </td>
      <td className="px-3 py-3">
        <Badge variant={transactionTypeBadge(transaction.transactionType)}>
          {transactionTypeLabel(transaction.transactionType)}
        </Badge>
      </td>
      <td className="px-3 py-3 text-sm text-text-muted">
        <div className="leading-tight">
          <p>{source}</p>
          <p className="text-xs">{isTransfer ? `→ ${target}` : target}</p>
        </div>
      </td>
      <td className={`nums px-3 py-3 text-right text-sm font-semibold whitespace-nowrap ${amountColor}`}>
        {formatCurrency(transaction.amount ?? 0)}
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onEdit(transaction)}
            className="text-text-muted hover:text-text"
            aria-label="Editar"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            onClick={() => onDuplicate(transaction)}
            className="text-text-muted hover:text-text"
            aria-label="Duplicar"
          >
            <Copy size={16} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(transaction)}
            className="text-expense transition-colors hover:brightness-125"
            aria-label="Excluir"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}
