import { useMemo, useState } from 'react';
import {
  useAccountTypes,
  useAccounts,
  useCreateAccount,
  useDeleteAccount,
  useUpdateAccount,
} from './useAccounts';
import type { AccountFormValues } from '../components/AccountFormModal';
import type { BankAccount } from '../types/accounts.types';

export function useAccountsPageLogic() {
  const accountsQuery = useAccounts();
  const accountTypesQuery = useAccountTypes();
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();
  const deleteAccount = useDeleteAccount();

  const [formOpen, setFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<BankAccount | null>(null);

  const accountTypes = accountTypesQuery.data ?? [];

  const accountTypeNames = useMemo(() => {
    const map = new Map<number, string>();
    accountTypes.forEach((type) => map.set(type.accountType, type.name));
    return map;
  }, [accountTypes]);

  const openCreate = () => {
    setEditingAccount(null);
    setFormOpen(true);
  };

  const openEdit = (account: BankAccount) => {
    setEditingAccount(account);
    setFormOpen(true);
  };

  const handleFormOpenChange = (open: boolean) => {
    setFormOpen(open);
    if (!open) setEditingAccount(null);
  };

  const submitForm = (values: AccountFormValues) => {
    if (editingAccount) {
      updateAccount.mutate(
        {
          bankAccount: editingAccount.bankAccount,
          name: values.name,
          accountType: values.accountType,
          color: values.color,
          icon: values.icon,
          notes: values.notes,
          active: editingAccount.active,
        },
        { onSuccess: () => handleFormOpenChange(false) },
      );
      return;
    }

    createAccount.mutate(
      {
        name: values.name,
        accountType: values.accountType,
        initialBalance: values.initialBalance,
        color: values.color,
        icon: values.icon,
        notes: values.notes,
      },
      { onSuccess: () => handleFormOpenChange(false) },
    );
  };

  const confirmDelete = () => {
    if (!accountToDelete) return;
    deleteAccount.mutate(accountToDelete.bankAccount, {
      onSuccess: () => setAccountToDelete(null),
    });
  };

  return {
    accounts: accountsQuery.data ?? [],
    isLoading: accountsQuery.isLoading,
    isError: accountsQuery.isError,
    accountTypes,
    accountTypeNames,
    formOpen,
    editingAccount,
    accountToDelete,
    submitting: createAccount.isPending || updateAccount.isPending,
    deleting: deleteAccount.isPending,
    openCreate,
    openEdit,
    handleFormOpenChange,
    submitForm,
    setAccountToDelete,
    confirmDelete,
  };
}
