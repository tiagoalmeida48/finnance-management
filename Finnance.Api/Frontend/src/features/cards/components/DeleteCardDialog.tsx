import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui';
import type { CreditCard } from '../types/cards.types';

interface DeleteCardDialogProps {
  card: CreditCard | null;
  deleting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteCardDialog({ card, deleting, onClose, onConfirm }: DeleteCardDialogProps) {
  return (
    <Dialog open={Boolean(card)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir cartão</DialogTitle>
        </DialogHeader>

        <p className="text-text-muted">
          Tem certeza que deseja excluir o cartão{' '}
          <span className="font-semibold text-text">{card?.name}</span>? Essa ação não pode ser
          desfeita.
        </p>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose} disabled={deleting}>
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
