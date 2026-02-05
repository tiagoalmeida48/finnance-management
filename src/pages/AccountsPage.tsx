import { Box, Container, Typography, Grid, Card, Button, Stack, Menu, MenuItem } from '@mui/material';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAccountsPageLogic } from '../shared/hooks/useAccountsPageLogic';
import { AccountCard } from '../shared/components/accounts/AccountCard';
import { AccountFormModal } from '../shared/components/accounts/AccountFormModal';
import { DeleteConfirmationModal } from '../shared/components/common/DeleteConfirmationModal';
import { useCreditCards } from '../shared/hooks/useCreditCards';

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

    return (
        <Box sx={{ pt: 4, pb: 4 }}>
            <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Contas</Typography>
                        <Typography color="text.secondary">Gerencie seus saldos.</Typography>
                    </Box>
                    <Button variant="contained" startIcon={<Plus />} size="large" onClick={handleAdd}>Nova Conta</Button>
                </Stack>
                <Grid container spacing={3}>
                    {isLoading ? <Grid size={{ xs: 12 }}><Typography>Carregando...</Typography></Grid> :
                        accounts?.length === 0 ? <Grid size={{ xs: 12 }}><Card sx={{ textAlign: 'center', py: 8 }}><Typography color="text.secondary">Vazio.</Typography></Card></Grid> :
                            accounts?.map((acc) => <AccountCard key={acc.id} account={acc} handleOpenMenu={handleOpenMenu} cards={cards} navigate={navigate} />)}
                </Grid>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu} PaperProps={{ sx: { bgcolor: 'background.paper', border: '1px solid #2A2A2A', minWidth: 150 } }}>
                    <MenuItem onClick={handleEdit}><Pencil size={16} style={{ marginRight: 8 }} /> Editar</MenuItem>
                    <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}><Trash2 size={16} style={{ marginRight: 8 }} /> Excluir</MenuItem>
                </Menu>
                <AccountFormModal open={modalOpen} onClose={() => setModalOpen(false)} account={selectedAccount} />
                <DeleteConfirmationModal
                    open={deleteModalOpen}
                    onClose={() => {
                        setDeleteModalOpen(false);
                        setMenuAccount(null);
                    }}
                    onConfirm={handleConfirmDelete}
                    title="Excluir Conta"
                    description="Tem certeza que deseja excluir esta conta? Todas as transações vinculadas a ela serão afetadas."
                    itemName={menuAccount?.name}
                    loading={deleteAccount.isPending}
                />
            </Container>
        </Box>
    );
}
