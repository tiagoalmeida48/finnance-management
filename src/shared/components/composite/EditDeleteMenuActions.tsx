import { Pencil, Trash2 } from "lucide-react";

interface EditDeleteMenuActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  editLabel?: string;
  deleteLabel?: string;
}

export function EditDeleteMenuActions({
  onEdit,
  onDelete,
  editLabel = "Editar",
  deleteLabel = "Excluir",
}: EditDeleteMenuActionsProps) {
  return (
    <>
      <button
        type="button"
        onClick={onEdit}
        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-white/5"
      >
        <Pencil size={16} /> {editLabel}
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm text-[var(--color-error)] hover:bg-white/5"
      >
        <Trash2 size={16} /> {deleteLabel}
      </button>
    </>
  );
}
