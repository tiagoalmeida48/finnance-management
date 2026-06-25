import { useEffect, useRef, type HTMLAttributes } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/shared/utils';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({ open, onOpenChange, children, className }: DialogProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return createPortal(
    <div
      className="animate-overlay-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onOpenChange(false);
        }
      }}
    >
      <div
        ref={contentRef}
        className={cn(
          'animate-dialog-in w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-border-strong bg-surface-gradient shadow-elevated',
          className,
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {}

export function DialogContent({ className, ...props }: DialogContentProps) {
  return <div className={cn('p-5', className)} {...props} />;
}

export function DialogHeader({ className, ...props }: DialogContentProps) {
  return <div className={cn('mb-4 pb-3 border-b border-border', className)} {...props} />;
}

export function DialogTitle({ className, ...props }: DialogContentProps) {
  return <h2 className={cn('text-lg font-bold text-text', className)} {...props} />;
}

export function DialogFooter({ className, ...props }: DialogContentProps) {
  return (
    <div className={cn('mt-5 pt-3 border-t border-border flex gap-2 justify-end', className)} {...props} />
  );
}
