import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAccountsPageLogic } from '@/pages/accounts/hooks/useAccountsPageLogic';
import { AccountCard } from './components/cards/AccountCard';
import { AccountFormModal } from './components/modals/AccountFormModal';
import { DeleteConfirmationModal } from '@/shared/components/composite/DeleteConfirmationModal';
import { useCreditCards } from '@/shared/hooks/api/useCreditCards';
import { PageHeader } from '@/shared/components/composite/PageHeader';
import { CollectionState } from '@/shared/components/composite/CollectionState';
import { ActionMenuPopover } from '@/shared/components/composite/ActionMenuPopover';
import { EditDeleteMenuActions } from '@/shared/components/composite/EditDeleteMenuActions';
import { Container } from '@/shared/components/layout/Container';
import { Section } from '@/shared/components/layout/Section';
import { Grid } from '@/shared/components/layout/Grid';
import { messages } from '@/shared/i18n/messages';

export function AccountsPage() {
    const navigate = useNavigate();
    const {
        accounts, isLoading, deleteAccount,
        modalOpen, setModalOpen,
        selectedAccount,
        deleteModalOpen, setDeleteModalOpen,
        anchorEl,
        menuAccount, setMenuAccount,
        handleOpenMenu, handleCloseMenu,
        handleEdit, handleDelete, handleConfirmDelete, handleAdd
    } = useAccountsPageLogic();

    const { data: cards } = useCreditCards();
    const isEmpty = !accounts || accounts.length === 0;
    const pageMessages = messages.accounts.page;
    const deleteModalMessages = messages.accounts.deleteModal;

    return (
        <Section className="pb-4">
            <Container>
                <PageHeader
                    title={pageMessages.title}
                    subtitle={pageMessages.subtitle}
                    actions={
                        <Button variant="contained" startIcon={<Plus />} size="large" onClick={handleAdd}>
                            {pageMessages.newButton}
                        </Button>
                    }
                    className="w-full"
                />

                <Grid className="gap-3 md:grid-cols-2 lg:grid-cols-4">
                    <CollectionState
                        isLoading={isLoading}
                        isEmpty={isEmpty}
                        emptyFallback={
                            <Card className="py-8 text-center">
                                <p className="text-[var(--color-text-secondary)]">{pageMessages.emptyState}</p>
                            </Card>
                        }
                    >
                        {accounts?.map((acc) => (
                            <AccountCard
                                key={acc.id}
                                account={acc}
                                handleOpenMenu={handleOpenMenu}
                                cards={cards}
                                navigate={navigate}
                            />
                        ))}
                    </CollectionState>
                </Grid>
                <ActionMenuPopover open={Boolean(anchorEl)} onClose={handleCloseMenu} anchorEl={anchorEl}>
                    <EditDeleteMenuActions onEdit={handleEdit} onDelete={handleDelete} />
                </ActionMenuPopover>
                <AccountFormModal open={modalOpen} onClose={() => setModalOpen(false)} account={selectedAccount} />
                <DeleteConfirmationModal
                    open={deleteModalOpen}
                    onClose={() => {
                        setDeleteModalOpen(false);
                        setMenuAccount(null);
                    }}
                    onConfirm={handleConfirmDelete}
                    title={deleteModalMessages.title}
                    description={deleteModalMessages.description}
                    itemName={menuAccount?.name}
                    loading={deleteAccount.isPending}
                />
            </Container>
        </Section>
    );
}
