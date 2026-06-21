import { useMemo, useState } from 'react';
import {
  useCreateUser,
  useDeleteUser,
  useUpdateUser,
  useUpdateUserPassword,
  useUsers,
} from './useUsers';
import type { UserFormValues } from '../components/UserFormModal';
import type { UserPasswordValues } from '../components/UserPasswordModal';
import type { ManagedUser } from '../types/users.types';

export function useUsersPageLogic() {
  const usersQuery = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const updatePassword = useUpdateUserPassword();
  const deleteUser = useDeleteUser();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ManagedUser | null>(null);
  const [passwordTarget, setPasswordTarget] = useState<ManagedUser | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ManagedUser | null>(null);

  const users = useMemo<ManagedUser[]>(() => {
    const items = usersQuery.data ?? [];
    return [...items].sort((a, b) =>
      a.email.localeCompare(b.email, 'pt-BR', { sensitivity: 'base' }),
    );
  }, [usersQuery.data]);

  const isEmpty = !usersQuery.isLoading && users.length === 0;

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (user: ManagedUser) => {
    setEditing(user);
    setFormOpen(true);
  };

  const handleFormOpenChange = (open: boolean) => {
    setFormOpen(open);
    if (!open) setEditing(null);
  };

  const submitForm = (values: UserFormValues) => {
    if (editing) {
      updateUser.mutate(
        {
          user: editing.user,
          email: values.email,
          fullName: values.fullName,
          isAdmin: values.isAdmin,
        },
        { onSuccess: () => handleFormOpenChange(false) },
      );
      return;
    }

    createUser.mutate(
      {
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        isAdmin: values.isAdmin,
      },
      { onSuccess: () => handleFormOpenChange(false) },
    );
  };

  const submitPassword = (values: UserPasswordValues) => {
    if (!passwordTarget) return;
    updatePassword.mutate(
      { user: passwordTarget.user, password: values.password },
      { onSuccess: () => setPasswordTarget(null) },
    );
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteUser.mutate(pendingDelete.user, {
      onSuccess: () => setPendingDelete(null),
    });
  };

  return {
    users,
    isEmpty,
    isLoading: usersQuery.isLoading,
    isError: usersQuery.isError,
    formOpen,
    editing,
    passwordTarget,
    pendingDelete,
    submitting: createUser.isPending || updateUser.isPending,
    savingPassword: updatePassword.isPending,
    deleting: deleteUser.isPending,
    openCreate,
    openEdit,
    handleFormOpenChange,
    submitForm,
    requestPassword: setPasswordTarget,
    submitPassword,
    requestDelete: setPendingDelete,
    confirmDelete,
  };
}
