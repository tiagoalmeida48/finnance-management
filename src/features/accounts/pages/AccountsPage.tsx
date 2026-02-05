import { useState } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, IconButton, Button, Stack, Menu, MenuItem, Divider } from '@mui/material';
import { Plus, MoreVertical, CreditCard, Wallet, Landmark, Pencil, Trash2 } from 'lucide-react';
import { useAccounts, useDeleteAccount } from '../hooks/useAccounts';
import { AccountFormModal } from '../components/AccountFormModal';
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal';
import { Account } from '../services/accounts.service';
import { useCreditCards } from '../../cards/hooks/useCreditCards';
import { useNavigate } from 'react-router-dom';

export function AccountsPage() {
    const { data: accounts, isLoading } = useAccounts();
    const deleteAccount = useDeleteAccount();
    const { data: cards } = useCreditCards();
    const navigate = useNavigate();

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

    const getIcon = (type: string, color: string = '#D4AF37') => {
        switch (type) {
            case 'checking': return <Landmark size={24} color={color} />;
            case 'savings': return <Wallet size={24} color={color} />;
            default: return <CreditCard size={24} color={color} />;
        }
    };

    return (
        <Box sx={{ pt: 4, pb: 4 }}>
            <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Contas</Typography>
                        <Typography color="text.secondary">Gerencie suas instituições financeiras e saldos.</Typography>
                    </Box>
                    <Button variant="contained" startIcon={<Plus />} size="large" onClick={handleAdd}>
                        Nova Conta
                    </Button>
                </Stack>

                <Grid container spacing={3}>
                    {isLoading ? (
                        <Grid size={{ xs: 12 }}><Typography>Carregando contas...</Typography></Grid>
                    ) : accounts?.length === 0 ? (
                        <Grid size={{ xs: 12 }}>
                            <Card sx={{ textAlign: 'center', py: 8 }}>
                                <Typography color="text.secondary">Nenhuma conta cadastrada ainda.</Typography>
                            </Card>
                        </Grid>
                    ) : accounts?.map((account) => (
                        <Grid size={{ xs: 12, md: 4 }} key={account.id}>
                            <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                        <Box sx={{ p: 1.5, bgcolor: `${account.color || '#D4AF37'}1A`, borderRadius: 2, mb: 2 }}>
                                            {getIcon(account.type, account.color)}
                                        </Box>
                                        <IconButton size="small" onClick={(e) => handleOpenMenu(e, account)}>
                                            <MoreVertical size={18} />
                                        </IconButton>
                                    </Stack>
                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>{account.name}</Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                                        {account.type === 'checking' ? 'Conta Corrente' :
                                            account.type === 'savings' ? 'Poupança' :
                                                account.type === 'investment' ? 'Investimento' :
                                                    account.type === 'wallet' ? 'Dinheiro' : 'Outro'}
                                    </Typography>

                                    <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.05)' }} />

                                    <Stack spacing={1.5}>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Saldo Inicial</Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(account.initial_balance)}
                                            </Typography>
                                        </Box>

                                        <Box>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Saldo Atual</Typography>
                                            <Typography variant="h5" sx={{ fontWeight: 700, color: account.current_balance >= 0 ? (account.color || '#D4AF37') : 'error.main' }}>
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(account.current_balance)}
                                            </Typography>
                                        </Box>


                                    </Stack>

                                    {cards?.some(c => c.bank_account_id === account.id) && (
                                        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                                            <Button
                                                fullWidth
                                                variant="outlined"
                                                size="small"
                                                startIcon={<CreditCard size={14} />}
                                                onClick={() => {
                                                    const card = cards.find(c => c.bank_account_id === account.id);
                                                    if (card) navigate(`/cards/${card.id}`);
                                                }}
                                                sx={{
                                                    fontSize: '0.7rem',
                                                    borderColor: 'rgba(212, 175, 55, 0.3)',
                                                    color: '#D4AF37',
                                                    '&:hover': {
                                                        borderColor: '#D4AF37',
                                                        bgcolor: 'rgba(212, 175, 55, 0.05)'
                                                    }
                                                }}
                                            >
                                                Ver Cartão Vinculado
                                            </Button>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleCloseMenu}
                    PaperProps={{
                        sx: { bgcolor: 'background.paper', border: '1px solid #2A2A2A', minWidth: 150 }
                    }}
                >
                    <MenuItem onClick={handleEdit}>
                        <Pencil size={16} style={{ marginRight: 8 }} /> Editar
                    </MenuItem>
                    <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                        <Trash2 size={16} style={{ marginRight: 8 }} /> Excluir
                    </MenuItem>
                </Menu>

                <AccountFormModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    account={selectedAccount}
                />

                <DeleteConfirmationModal
                    open={deleteModalOpen}
                    onClose={() => {
                        setDeleteModalOpen(false);
                        setMenuAccount(null);
                    }}
                    onConfirm={handleConfirmDelete}
                    title="Excluir Conta"
                    description="Tem certeza que deseja excluir esta conta? Todas as transações vinculadas serão afetadas."
                    itemName={menuAccount?.name}
                    loading={deleteAccount.isPending}
                />
            </Container>
        </Box>
    );
}
