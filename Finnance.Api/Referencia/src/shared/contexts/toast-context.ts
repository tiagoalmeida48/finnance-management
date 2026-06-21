import { createContext } from 'react';

export type ToastType = 'success' | 'error' | 'warning';

export interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);
