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
                left: `${menuRect.left}px`,
              }
            : undefined
        }
        className={`fixed z-[1200] min-w-[150px] rounded-md border border-[var(--color-border)] bg-[var(--color-card)] p-1 shadow-lg ${className ?? ''}`.trim()}
      >
        {children}
      </div>
    </>
  );
}
