import { Pencil, Trash2 } from 'lucide-react';

interface EditDeleteMenuActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  editLabel?: string;
  deleteLabel?: string;
}

export function EditDeleteMenuActions({
  onEdit,
  onDelete,
  editLabel = 'Editar',
  deleteLabel = 'Excluir',
}: EditDeleteMenuActionsProps) {
  return (
    <>
      <button
        type="button"
        onClick={onEdit}
        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-white/[0.06] hover:text-[var(--color-text-primary)]"
      >
        <Pencil size={14} className="shrink-0 text-[var(--color-text-muted)]" />
        {editLabel}
      </button>
      <div className="my-1 border-t border-[var(--color-border)]" />
      <button
        type="button"
        onClick={onDelete}
        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium text-[var(--color-error)] transition-colors hover:bg-[var(--overlay-error-10)]"
      >
        <Trash2 size={14} className="shrink-0" />
        {deleteLabel}
      </button>
    </>
  );
}
