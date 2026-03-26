import { Button } from '@/shared/components/ui/button';
import { DialogActions } from '@/shared/components/ui/dialog';
import { messages } from '@/shared/i18n/messages';
import { Text } from '@/shared/components/ui/Text';

interface TransactionFormActionsProps {
  isSubmitting: boolean;
  submitLabel: string;
  onClose: () => void;
}

export function TransactionFormActions({
  isSubmitting,
  submitLabel,
  onClose,
}: TransactionFormActionsProps) {
  return (
    <DialogActions className="justify-end gap-1.5 border-t border-white/[0.04] px-3 py-2">
      <Button type="button" onClick={onClose} variant="ghost" size="default">
        {messages.common.actions.cancel}
      </Button>
      <Button
        type="submit"
        disabled={isSubmitting}
        variant="default"
        size="default"
        className="shadow-[0_2px_8px_var(--overlay-primary-25)] hover:-translate-y-px hover:shadow-[0_4px_16px_var(--overlay-primary-30)] active:translate-y-0"
      >
        {isSubmitting && (
          <Text
            as="span"
            className="mr-1.5 inline-block h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-background)] border-r-transparent"
          />
        )}
        {submitLabel}
      </Button>
    </DialogActions>
  );
}
