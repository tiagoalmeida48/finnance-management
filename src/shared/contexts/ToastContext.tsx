import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { registerToastBridge } from "@/shared/utils/toastBridge";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

type ToastType = "success" | "error" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="size-4 shrink-0" />,
  error: <XCircle className="size-4 shrink-0" />,
  warning: <AlertCircle className="size-4 shrink-0" />,
};

const STYLES: Record<ToastType, string> = {
  success: "bg-[var(--color-success)] text-white",
  error: "bg-[var(--color-error)] text-white",
  warning: "bg-[var(--color-warning)] text-white",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const add = useCallback((message: string, type: ToastType) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value: ToastContextValue = {
    success: (msg) => add(msg, "success"),
    error: (msg) => add(msg, "error"),
    warning: (msg) => add(msg, "warning"),
  };

  useEffect(() => {
    registerToastBridge(value);
  }, []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`flex items-center gap-2 rounded-lg px-4 py-3 shadow-lg text-sm max-w-sm ${STYLES[toast.type]}`}
            >
              {ICONS[toast.type]}
              <span className="flex-1">{toast.message}</span>
              <button
                onClick={() => remove(toast.id)}
                className="ml-1 opacity-70 hover:opacity-100 transition-opacity"
                aria-label="Fechar notificação"
              >
                <X className="size-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
