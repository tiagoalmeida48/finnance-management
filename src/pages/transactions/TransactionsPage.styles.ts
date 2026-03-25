export const transactionsPageStyles = {
  content: "flex flex-col gap-3",
  rowMenu:
    "fixed z-50 min-w-[170px] rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-1",
  rowMenuAction:
    "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-white/5 disabled:opacity-50",
  rowMenuActionDefault: "text-[var(--color-text-primary)]",
  rowMenuActionDanger: "text-[var(--color-error)]",
  batchBar:
    "fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--overlay-white-08)] bg-[var(--color-card-hover)] px-3 py-2",
  batchBarInner: "flex flex-wrap items-center justify-center gap-2",
  batchBarText: "text-sm font-medium text-[var(--color-text-primary)]",
};
