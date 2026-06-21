import { useEffect, useRef, type HTMLAttributes } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/shared/utils';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
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
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onOpenChange(false);
        }
      }}
    >
      <div
        ref={contentRef}
        className="bg-surface border border-border rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {}

export function DialogContent({ className, ...props }: DialogContentProps) {
  return <div className={cn('p-6', className)} {...props} />;
}

export function DialogHeader({ className, ...props }: DialogContentProps) {
  return <div className={cn('mb-4 pb-4 border-b border-border', className)} {...props} />;
}

export function DialogTitle({ className, ...props }: DialogContentProps) {
  return <h2 className={cn('text-xl font-bold text-text', className)} {...props} />;
}

export function DialogFooter({ className, ...props }: DialogContentProps) {
  return (
    <div className={cn('mt-6 pt-4 border-t border-border flex gap-2 justify-end', className)} {...props} />
  );
}
