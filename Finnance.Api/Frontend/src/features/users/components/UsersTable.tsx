import { Pencil, KeyRound, Power, Trash2 } from 'lucide-react';
import { Badge, SortableTh } from '@/shared/components/ui';
import { useSortableData, type SortAccessors } from '@/shared/hooks';
import type { ManagedUser } from '../types/users.types';

interface UsersTableProps {
  users: ManagedUser[];
  onEdit: (user: ManagedUser) => void;
  onResetPassword: (user: ManagedUser) => void;
  onDelete: (user: ManagedUser) => void;
  onToggleActive: (user: ManagedUser) => void;
}

const accessors: SortAccessors<ManagedUser> = {
  fullName: (u) => u.fullName,
  email: (u) => u.email,
  isAdmin: (u) => u.isAdmin,
  active: (u) => u.active,
};

export function UsersTable({
  users,
  onEdit,
  onResetPassword,
  onDelete,
  onToggleActive,
}: UsersTableProps) {
  const { sorted, sortKey, direction, toggleSort } = useSortableData(users, accessors, 'fullName');

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border font-mono text-[0.65rem] uppercase tracking-wider text-text-muted">
            <SortableTh label="Nome" sortKey="fullName" activeKey={sortKey} direction={direction} onSort={toggleSort} />
            <SortableTh label="E-mail" sortKey="email" activeKey={sortKey} direction={direction} onSort={toggleSort} />
            <SortableTh label="Administrador" sortKey="isAdmin" activeKey={sortKey} direction={direction} onSort={toggleSort} />
            <SortableTh label="Status" sortKey="active" activeKey={sortKey} direction={direction} onSort={toggleSort} />
            <th className="px-3 py-2.5 font-medium text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((user) => (
            <tr key={user.user} className="border-b border-border/60">
              <td className="px-3 py-2.5 font-medium text-text">{user.fullName || '-'}</td>
              <td className="nums px-3 py-2.5 text-xs text-text-muted">{user.email}</td>
              <td className="px-3 py-2">
                <Badge variant={user.isAdmin ? 'primary' : 'default'}>
                  {user.isAdmin ? 'Sim' : 'Não'}
                </Badge>
              </td>
              <td className="px-3 py-2">
                <Badge variant={user.active ? 'income' : 'expense'}>
                  {user.active ? 'Ativo' : 'Inativo'}
                </Badge>
              </td>
              <td className="px-3 py-2">
                <div className="flex justify-end gap-1">
                  <button
                    type="button"
                    aria-label={user.active ? 'Desativar usuário' : 'Ativar usuário'}
                    title={user.active ? 'Desativar' : 'Ativar'}
                    onClick={() => onToggleActive(user)}
                    className="rounded-md p-1.5 text-text-muted hover:bg-surface-2 hover:text-text transition-colors"
                  >
                    <Power size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label="Editar usuário"
                    onClick={() => onEdit(user)}
                    className="rounded-md p-1.5 text-text-muted hover:bg-surface-2 hover:text-text transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label="Redefinir senha"
                    onClick={() => onResetPassword(user)}
                    className="rounded-md p-1.5 text-text-muted hover:bg-surface-2 hover:text-text transition-colors"
                  >
                    <KeyRound size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label="Remover usuário"
                    onClick={() => onDelete(user)}
                    className="rounded-md p-1.5 text-text-muted hover:bg-surface-2 hover:text-expense transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
