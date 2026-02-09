import { Grid, Card, CardContent, Stack, Box, IconButton, Typography, Divider, Button } from '@mui/material';
import { MoreVertical, Landmark, Wallet, CreditCard } from 'lucide-react';
import type { NavigateFunction } from 'react-router-dom';
import { Account } from '../../interfaces/account.interface';
import { CreditCard as CardInterface } from '../../interfaces/credit-card.interface';

interface AccountCardProps {
    account: Account;
    handleOpenMenu: (event: React.MouseEvent<HTMLElement>, account: Account) => void;
    cards: CardInterface[] | undefined;
    navigate: NavigateFunction;
}

export function AccountCard({ account, handleOpenMenu, cards, navigate }: AccountCardProps) {
    const getIcon = (type: string, color: string = '#D4AF37') => {
        switch (type) {
            case 'checking': return <Landmark size={24} color={color} />;
            case 'savings': return <Wallet size={24} color={color} />;
            default: return <CreditCard size={24} color={color} />;
        }
    };

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    return (
        <Grid size={{ xs: 12, md: 4 }}>
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
                                {formatCurrency(account.initial_balance)}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Saldo Atual</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: account.current_balance >= 0 ? (account.color || '#D4AF37') : 'error.main' }}>
                                {formatCurrency(account.current_balance)}
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
    );
}
