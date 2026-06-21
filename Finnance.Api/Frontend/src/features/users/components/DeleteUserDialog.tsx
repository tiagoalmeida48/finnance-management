import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui';
import type { ManagedUser } from '../types/users.types';

interface DeleteUserDialogProps {
  user: ManagedUser | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  deleting?: boolean;
}

export function DeleteUserDialog({ user, onOpenChange, onConfirm, deleting }: DeleteUserDialogProps) {
  return (
    <Dialog open={Boolean(user)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remover usuário</DialogTitle>
        </DialogHeader>

        <p className="text-text-muted">
          Tem certeza que deseja remover o usuário{' '}
          <span className="font-semibold text-text">{user?.email}</span>? Essa ação não pode ser
          desfeita.
        </p>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" variant="danger" loading={deleting} onClick={onConfirm}>
            Remover
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
