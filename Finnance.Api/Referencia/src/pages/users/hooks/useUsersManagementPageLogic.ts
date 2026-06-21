import { useState, useCallback, useEffect } from 'react';
import type { ManagedUser } from '@/shared/interfaces/user-management.interface';
import { usersService } from '@/shared/services/users.service';
import { messages } from '@/shared/i18n/messages';
import { normalizeRpcError } from '@/shared/utils/rpcErrors';

export function useUsersManagementPageLogic() {
  const pageMessages = messages.users.page;
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ManagedUser | null>(null);
  const [passwordTarget, setPasswordTarget] = useState<ManagedUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ManagedUser | null>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [saving, setSaving] = useState(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuUser, setMenuUser] = useState<ManagedUser | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, user: ManagedUser) => {
    setAnchorEl(event.currentTarget);
    setMenuUser(user);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const data = await usersService.listUsers();
      setUsers(data);
    } catch (error: unknown) {
      setMessage({ type: 'error', text: normalizeRpcError(error) });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setPassword('');
    setIsAdmin(false);
  };

  const handleCreate = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await usersService.createUser(email, password, fullName, isAdmin);
      setCreateOpen(false);
      resetForm();
      setMessage({ type: 'success', text: pageMessages.feedback.created });
      await loadUsers();
    } catch (error: unknown) {
      setMessage({ type: 'error', text: normalizeRpcError(error) });
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEdit = (user: ManagedUser) => {
    setEditTarget(user);
    setFullName(user.full_name ?? '');
    setEmail(user.email);
    setIsAdmin(user.is_admin);
  };

  const handleMenuEdit = () => {
    if (menuUser) {
      handleOpenEdit(menuUser);
      handleCloseMenu();
    }
  };

  const handleMenuPassword = () => {
    if (menuUser) {
      setPasswordTarget(menuUser);
      setPassword('');
      handleCloseMenu();
    }
  };

  const handleMenuDelete = () => {
    if (menuUser) {
      setDeleteTarget(menuUser);
      handleCloseMenu();
    }
  };

  const handleUpdate = async () => {
    if (!editTarget) return;
    setSaving(true);
    setMessage(null);
    try {
      await usersService.updateUser(editTarget.id, email, fullName, isAdmin);
      setEditTarget(null);
      setMessage({ type: 'success', text: pageMessages.feedback.updated });
      await loadUsers();
    } catch (error: unknown) {
      setMessage({ type: 'error', text: normalizeRpcError(error) });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!passwordTarget) return;
    setSaving(true);
    setMessage(null);
    try {
      await usersService.updatePassword(passwordTarget.id, password);
      setPasswordTarget(null);
      setPassword('');
      setMessage({
        type: 'success',
        text: pageMessages.feedback.passwordUpdated,
      });
    } catch (error: unknown) {
      setMessage({ type: 'error', text: normalizeRpcError(error) });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    setMessage(null);
    try {
      await usersService.deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      setMessage({ type: 'success', text: pageMessages.feedback.removed });
      await loadUsers();
    } catch (error: unknown) {
      setMessage({ type: 'error', text: normalizeRpcError(error) });
    } finally {
      setSaving(false);
    }
  };

  return {
    users,
    loading,
    message,
    isEmpty: users.length === 0,
    createOpen,
    setCreateOpen,
    editTarget,
    setEditTarget,
    passwordTarget,
    setPasswordTarget,
    deleteTarget,
    setDeleteTarget,
    fullName,
    setFullName,
    email,
    setEmail,
    password,
    setPassword,
    isAdmin,
    setIsAdmin,
    saving,
    anchorEl,
    handleOpenMenu,
    handleCloseMenu,
    handleMenuEdit,
    handleMenuPassword,
    handleMenuDelete,
    resetForm,
    handleCreate,
    handleOpenEdit,
    handleUpdate,
    handleUpdatePassword,
    handleDelete,
    pageMessages,
  };
}
