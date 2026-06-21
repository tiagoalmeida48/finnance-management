import type { FormEventHandler, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@/shared/components/ui/dialog';

type DialogMaxWidth = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface FormDialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  onSubmit: FormEventHandler<HTMLFormElement>;
  children: ReactNode;
  actions: ReactNode;
  fullWidth?: boolean;
  maxWidth?: DialogMaxWidth | false;
  className?: string;
  titleClassName?: string;
  contentClassName?: string;
  actionsClassName?: string;
  formClassName?: string;
}

export function FormDialog({
  open,
  onClose,
  title,
  onSubmit,
  children,
  actions,
  fullWidth = true,
  maxWidth = 'xs',
  className,
  titleClassName,
  contentClassName,
  actionsClassName,
  formClassName,
}: FormDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth={fullWidth}
      maxWidth={maxWidth}
      className={className}
    >
      <DialogTitle className={cn('font-bold', titleClassName)}>{title}</DialogTitle>
      <form onSubmit={onSubmit} className={formClassName}>
        <DialogContent className={contentClassName}>{children}</DialogContent>
        <DialogActions className={actionsClassName}>{actions}</DialogActions>
      </form>
    </Dialog>
  );
}
