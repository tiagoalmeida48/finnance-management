import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/shared/utils';

export type ToastVariant = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const colors = {
    success: 'bg-income/20 text-income border border-income/30',
    error: 'bg-expense/20 text-expense border border-expense/30',
    info: 'bg-transfer/20 text-transfer border border-transfer/30',
  };

  return (
    <div
      className={cn(
        'px-4 py-3 rounded-md text-sm font-medium animate-toast-in',
        colors[toast.variant],
      )}
    >
      {toast.message}
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return createPortal(
    <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>,
    document.body,
  );
}
