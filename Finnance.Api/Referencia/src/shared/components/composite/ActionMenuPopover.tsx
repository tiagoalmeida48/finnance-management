import type { ReactNode, Ref } from 'react';

interface ActionMenuPopoverProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  anchorEl?: HTMLElement | null;
  offset?: number;
  menuRef?: Ref<HTMLDivElement>;
  className?: string;
}

export function ActionMenuPopover({
  open,
  onClose,
  children,
  anchorEl,
  offset = 8,
  menuRef,
  className,
}: ActionMenuPopoverProps) {
  if (!open) return null;

  const menuRect = anchorEl?.getBoundingClientRect();

  return (
    <>
      <div className="fixed inset-0 z-[1199]" onClick={onClose} />
      <div
        ref={menuRef}
        style={
          menuRect
            ? {
                top: `${menuRect.bottom + offset}px`,
                right: `${window.innerWidth - menuRect.right}px`,
              }
            : undefined
        }
        className={`fixed z-[1200] min-w-[160px] rounded-xl border border-[var(--color-border)] bg-[var(--color-card-elevated)] p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-sm ${className ?? ''}`.trim()}
      >
        {children}
      </div>
    </>
  );
}
