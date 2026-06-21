import type { ReactNode } from 'react';
import { CalendarDays, CheckCircle2, Pencil, Plus, Trash2 } from 'lucide-react';
import type { Transaction } from '@/shared/services/transactions.service';
import { ActionMenuPopover } from '@/shared/components/composite/ActionMenuPopover';
import { messages } from '@/shared/i18n/messages';
import { transactionsPageStyles } from '../../TransactionsPage.styles';
import { Button } from '@/shared/components/ui/button';

interface TransactionsRowMenuProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  menuTransaction: Transaction | null;
  duplicatePending: boolean;
  insertInstallmentPending: boolean;
  onEdit: () => void;
  onDuplicate: () => void;
  onInsertInstallmentBetween: () => void;
  onTogglePaid: () => void;
  onDelete: () => void;
  onClose: () => void;
}

interface MenuActionProps {
  onClick: () => void;
  icon: ReactNode;
  label: string;
  actionColor?: 'default' | 'danger' | 'success' | 'warning';
  disabled?: boolean;
}

function MenuAction({ onClick, icon, label, actionColor = 'default', disabled }: MenuActionProps) {
  let colorClasses = 'text-[var(--color-text-primary)] hover:bg-white/5';
  if (actionColor === 'danger') {
    colorClasses = 'text-[var(--color-error)] hover:brightness-75 hover:bg-[var(--color-error)]/10';
  } else if (actionColor === 'success') {
    colorClasses =
      'text-[var(--color-success)] hover:brightness-75 hover:bg-[var(--color-success)]/10';
  } else if (actionColor === 'warning') {
    colorClasses =
      'text-[var(--color-warning)] hover:brightness-75 hover:bg-[var(--color-warning)]/10';
  }

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      disabled={disabled}
      className={`${transactionsPageStyles.rowMenuAction} w-full justify-start h-auto px-2 py-1.5 font-normal ${colorClasses}`}
    >
      {icon}
      {label}
    </Button>
  );
}

export function TransactionsRowMenu({
  open,
  anchorEl,
  menuTransaction,
  duplicatePending,
  insertInstallmentPending,
  onEdit,
  onDuplicate,
  onInsertInstallmentBetween,
  onTogglePaid,
  onDelete,
  onClose,
}: TransactionsRowMenuProps) {
  if (!open) return null;
  const rowMenuMessages = messages.transactions.rowMenu;

  return (
    <ActionMenuPopover open={open} onClose={onClose} anchorEl={anchorEl}>
      <MenuAction onClick={onEdit} icon={<Pencil size={16} />} label={rowMenuMessages.edit} />
      <MenuAction
        onClick={onDuplicate}
        disabled={duplicatePending}
        icon={<Plus size={16} />}
        label={rowMenuMessages.duplicate}
      />

      {menuTransaction?.installment_group_id ? (
        <MenuAction
          onClick={onInsertInstallmentBetween}
          disabled={insertInstallmentPending}
          icon={<CalendarDays size={16} />}
          label={rowMenuMessages.insertInstallmentBetween}
        />
      ) : null}

      <MenuAction
        onClick={onTogglePaid}
        icon={<CheckCircle2 size={16} />}
        label={menuTransaction?.is_paid ? rowMenuMessages.markPending : rowMenuMessages.markPaid}
        actionColor={menuTransaction?.is_paid ? 'warning' : 'success'}
      />

      <MenuAction
        onClick={onDelete}
        icon={<Trash2 size={16} />}
        label={rowMenuMessages.delete}
        actionColor="danger"
      />
    </ActionMenuPopover>
  );
}
