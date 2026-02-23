import { useState } from 'react';
import { useAccounts, useDeleteAccount } from '@/shared/hooks/api/useAccounts';
import { Account } from '@/shared/interfaces/account.interface';

export function useAccountsPageLogic() {
    const { data: accounts, isLoading } = useAccounts();
    const deleteAccount = useDeleteAccount();

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<Account | undefined>();
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [menuAccount, setMenuAccount] = useState<Account | null>(null);

    const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, account: Account) => {
        setAnchorEl(event.currentTarget);
        setMenuAccount(account);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleEdit = () => {
        setSelectedAccount(menuAccount || undefined);
        setModalOpen(true);
        handleCloseMenu();
    };

    const handleDelete = () => {
        if (!menuAccount) return;
        setDeleteModalOpen(true);
        handleCloseMenu();
    };

    const handleConfirmDelete = async () => {
        if (!menuAccount) return;
        try {
            await deleteAccount.mutateAsync(menuAccount.id);
            setDeleteModalOpen(false);
            setMenuAccount(null);
        } catch (error) {
            console.error('Error deleting account:', error);
        }
    };

    const handleAdd = () => {
        setSelectedAccount(undefined);
        setModalOpen(true);
    };

    return {
        accounts, isLoading, deleteAccount,
        modalOpen, setModalOpen,
        selectedAccount, setSelectedAccount,
        deleteModalOpen, setDeleteModalOpen,
        anchorEl, setAnchorEl,
        menuAccount, setMenuAccount,
        handleOpenMenu, handleCloseMenu,
        handleEdit, handleDelete, handleConfirmDelete, handleAdd
    };
}
