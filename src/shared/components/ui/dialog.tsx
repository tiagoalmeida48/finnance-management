import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type DialogMaxWidth = "xs" | "sm" | "md" | "lg" | "xl";

const maxWidthMap: Record<DialogMaxWidth, string> = {
  xs: "max-w-sm",
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
};

interface DialogContextValue {
  onClose?: () => void;
}

const DialogContext = React.createContext<DialogContextValue>({});

export interface DialogProps {
  open: boolean;
  onClose?: () => void;
  fullWidth?: boolean;
  maxWidth?: DialogMaxWidth | false;
  className?: string;
  children: React.ReactNode;
}

export function Dialog({
  open,
  onClose,
  fullWidth = false,
  maxWidth = "sm",
  className,
  children,
}: DialogProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <DialogContext.Provider value={{ onClose }}>
        <div
          role="dialog"
          aria-modal="true"
          className={cn(
            "w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-2xl",
            fullWidth && "w-full",
            maxWidth && maxWidthMap[maxWidth],
            className,
          )}
        >
          {children}
        </div>
      </DialogContext.Provider>
    </div>,
    document.body,
  );
}

export type DialogTitleProps = React.HTMLAttributes<HTMLDivElement>;

export function DialogTitle({ className, ...props }: DialogTitleProps) {
  return (
    <div
      className={cn("px-6 pt-6 text-lg font-semibold", className)}
      {...props}
    />
  );
}

export type DialogContentProps = React.HTMLAttributes<HTMLDivElement>;

export function DialogContent({ className, ...props }: DialogContentProps) {
  return <div className={cn("px-6 py-4", className)} {...props} />;
}

export type DialogActionsProps = React.HTMLAttributes<HTMLDivElement>;

export function DialogActions({ className, ...props }: DialogActionsProps) {
  return (
    <div
      className={cn("flex justify-end gap-2 px-6 pb-6 pt-3", className)}
      {...props}
    />
  );
}
