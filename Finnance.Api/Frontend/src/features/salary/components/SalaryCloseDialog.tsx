import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui';

interface SalaryCloseDialogProps {
  open: boolean;
  isClosing: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function SalaryCloseDialog({ open, isClosing, onClose, onConfirm }: SalaryCloseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Encerrar vigência atual</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-text-muted">
          A vigência atual será encerrada com a data de hoje. Esta ação não pode ser desfeita.
        </p>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isClosing}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={isClosing}>
            Encerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
