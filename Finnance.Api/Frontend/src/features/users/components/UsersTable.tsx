import { Edit2, KeyRound, Trash2 } from 'lucide-react';
import { Badge } from '@/shared/components/ui';
import type { ManagedUser } from '../types/users.types';

interface UsersTableProps {
  users: ManagedUser[];
  onEdit: (user: ManagedUser) => void;
  onResetPassword: (user: ManagedUser) => void;
  onDelete: (user: ManagedUser) => void;
}

export function UsersTable({ users, onEdit, onResetPassword, onDelete }: UsersTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-text-muted">
            <th className="px-3 py-2 font-medium">Nome</th>
            <th className="px-3 py-2 font-medium">E-mail</th>
            <th className="px-3 py-2 font-medium">Administrador</th>
            <th className="px-3 py-2 font-medium text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.user} className="border-b border-border/60">
              <td className="px-3 py-2 text-text">{user.fullName || '-'}</td>
              <td className="px-3 py-2 text-text-muted">{user.email}</td>
              <td className="px-3 py-2">
                <Badge variant={user.isAdmin ? 'primary' : 'default'}>
                  {user.isAdmin ? 'Sim' : 'Não'}
                </Badge>
              </td>
              <td className="px-3 py-2">
                <div className="flex justify-end gap-1">
                  <button
                    type="button"
                    aria-label="Editar usuário"
                    onClick={() => onEdit(user)}
                    className="rounded-md p-1.5 text-text-muted hover:bg-surface-2 hover:text-text transition-colors"
                  >
                    <Edit2 size={16} />
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
