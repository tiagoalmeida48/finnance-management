import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@/shared/components/ui/dialog';
import { messages } from '@/shared/i18n/messages';
import { Text } from '@/shared/components/ui/Text';

interface SalaryDeleteDialogProps {
  open: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function SalaryDeleteDialog({
  open,
  isDeleting,
  onClose,
  onConfirm,
}: SalaryDeleteDialogProps) {
  const dialogMessages = messages.salarySimulator.deleteDialog;
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{dialogMessages.title}</DialogTitle>
      <DialogContent>
        <Text className="text-sm text-white/70">{dialogMessages.description}</Text>
      </DialogContent>
      <DialogActions className="px-3 pb-2">
        <Button onClick={onClose} disabled={isDeleting}>
          {messages.common.actions.cancel}
        </Button>
        <Button color="error" variant="contained" onClick={onConfirm} disabled={isDeleting}>
          {isDeleting ? dialogMessages.deleting : dialogMessages.delete}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
