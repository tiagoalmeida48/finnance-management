import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui';
import type { Category } from '../types/categories.types';

interface DeleteCategoryDialogProps {
  category: Category | null;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteCategoryDialog({
  category,
  deleting,
  onClose,
  onConfirm,
}: DeleteCategoryDialogProps) {
  return (
    <Dialog open={!!category} onOpenChange={(value) => (value ? undefined : onClose())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir categoria</DialogTitle>
        </DialogHeader>

        <p className="text-text-muted">
          Tem certeza que deseja excluir a categoria{' '}
          <span className="font-semibold text-text">{category?.name}</span>? Essa ação não pode ser
          desfeita.
        </p>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={deleting}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={deleting}>
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
