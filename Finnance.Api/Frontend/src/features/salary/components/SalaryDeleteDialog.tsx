import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui';

interface SalaryDeleteDialogProps {
  open: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function SalaryDeleteDialog({ open, isDeleting, onClose, onConfirm }: SalaryDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir vigência atual</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-text-muted">
          A vigência atual em aberto será excluída e a vigência anterior voltará a ser a atual. Esta
          ação não pode ser desfeita.
        </p>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={isDeleting}>
            Excluir vigência
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
