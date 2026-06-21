import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui';
import type { BankAccount } from '../types/accounts.types';

interface DeleteAccountDialogProps {
  account: BankAccount | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  deleting?: boolean;
}

export function DeleteAccountDialog({
  account,
  onOpenChange,
  onConfirm,
  deleting,
}: DeleteAccountDialogProps) {
  return (
    <Dialog open={Boolean(account)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir conta</DialogTitle>
        </DialogHeader>

        <p className="text-text-muted">
          Tem certeza que deseja excluir a conta{' '}
          <span className="font-semibold text-text">{account?.name}</span>? Essa ação não pode ser
          desfeita.
        </p>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" variant="danger" loading={deleting} onClick={onConfirm}>
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
