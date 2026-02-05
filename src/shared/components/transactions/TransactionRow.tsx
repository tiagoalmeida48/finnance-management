import { format } from 'date-fns';
import { TableRow, TableCell, Checkbox, Tooltip, Box, Stack, Typography, Chip, IconButton } from '@mui/material';
import { Clock, CheckCircle2, CreditCard, ArrowUpRight, ArrowDownLeft, ArrowRightLeft, RefreshCw, MoreVertical } from 'lucide-react';
import { Transaction } from '../../services/transactions.service';

interface TransactionRowProps {
    transaction: Transaction;
    isChild?: boolean;
    selectedIds: string[];
    handleSelectRow: (id: string) => void;
    handleTogglePaid: (t: Transaction) => void;
    handleOpenMenu: (e: React.MouseEvent<HTMLElement>, t: Transaction) => void;
    isPendingToggle?: boolean;
}

export function TransactionRow({
    transaction: t,
    isChild = false,
    selectedIds,
    handleSelectRow,
    handleTogglePaid,
    handleOpenMenu,
    isPendingToggle
}: TransactionRowProps) {
    const renderPrice = (amount: number, type: string) => (
        <Typography variant="body2" sx={{
            fontWeight: 700,
            color: type === 'income' ? 'success.main' : type === 'expense' ? 'error.main' : '#FACC15'
        }}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)}
        </Typography>
    );

    return (
        <TableRow key={t.id} sx={{
            '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' },
            bgcolor: selectedIds.includes(t.id) ? 'rgba(212, 175, 55, 0.05)' : isChild ? 'rgba(255,255,255,0.01)' : 'transparent',
            transition: 'opacity 0.2s',
            opacity: isPendingToggle ? 0.6 : 1
        }}>
            <TableCell padding="checkbox">
                <Checkbox
                    size="small"
                    checked={selectedIds.includes(t.id)}
                    onChange={() => handleSelectRow(t.id)}
                />
            </TableCell>
            <TableCell sx={{ width: 48, py: 1 }}>
                {!t.card_id ? (
                    <Checkbox
                        size="small"
                        checked={t.is_paid}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePaid(t);
                        }}
                        icon={<Clock size={16} style={{ opacity: 0.3 }} />}
                        checkedIcon={<CheckCircle2 size={16} color="#D4AF37" />}
                        sx={{ p: 0.5 }}
                    />
                ) : (
                    <Tooltip title="Pago via fatura">
                        <Box sx={{ p: 0.5, display: 'flex', justifyContent: 'center' }}>
                            <CreditCard size={16} style={{ opacity: 0.5 }} />
                        </Box>
                    </Tooltip>
                )}
            </TableCell>
            <TableCell sx={{ color: 'text.secondary', width: 100, fontSize: '0.85rem' }}>
                {format(new Date(t.payment_date + 'T12:00:00'), 'dd/MM/yyyy')}
            </TableCell>
            <TableCell>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    {!isChild && (
                        <Box sx={{
                            p: 1,
                            borderRadius: 1,
                            bgcolor: t.type === 'income' ? 'rgba(46, 125, 50, 0.1)' :
                                t.type === 'expense' ? 'rgba(211, 47, 47, 0.1)' :
                                    'rgba(212, 175, 55, 0.1)',
                            color: t.type === 'income' ? 'success.main' :
                                t.type === 'expense' ? 'error.main' :
                                    'primary.main'
                        }}>
                            {t.type === 'income' ? <ArrowUpRight size={16} /> :
                                t.type === 'expense' ? <ArrowDownLeft size={16} /> :
                                    <ArrowRightLeft size={16} />}
                        </Box>
                    )}
                    {isChild && <Box sx={{ width: 32 }} />}
                    <Box sx={{ opacity: t.is_paid ? 1 : 0.6 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{t.description}</Typography>
                            {t.is_fixed && (
                                <Tooltip title="Recorrente">
                                    <RefreshCw size={12} style={{ opacity: 0.5 }} />
                                </Tooltip>
                            )}
                        </Stack>
                        <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                            {t.installment_number && (
                                <Chip
                                    label={`${t.installment_number}/${t.total_installments}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ height: 16, fontSize: '0.65rem', borderColor: 'primary.main', color: 'primary.main' }}
                                />
                            )}
                            {t.is_fixed && (
                                <Chip label="Fixo" size="small" variant="outlined" sx={{ height: 16, fontSize: '0.65rem' }} />
                            )}
                        </Stack>
                    </Box>
                </Stack>
            </TableCell>
            <TableCell>
                {t.type !== 'transfer' ? (
                    <Chip
                        label={t.category?.name || 'Sem Categoria'}
                        size="small"
                        sx={{
                            bgcolor: t.category?.color ? `${t.category.color}20` : 'rgba(255,255,255,0.05)',
                            color: t.category?.color || 'inherit',
                            fontWeight: 600,
                            border: '1px solid rgba(255,255,255,0.05)',
                            fontSize: '0.75rem',
                            opacity: t.is_paid ? 1 : 0.6
                        }}
                    />
                ) : '-'}
            </TableCell>
            <TableCell>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{
                        fontSize: '1.2rem',
                        opacity: t.is_paid ? 1 : 0.6,
                        filter: t.is_paid ? 'none' : 'grayscale(1)',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        {t.payment_method === 'money' && '💵'}
                        {t.payment_method === 'debit' && '💳'}
                        {t.payment_method === 'credit' && '💳'}
                        {t.payment_method === 'pix' && '📱'}
                        {(!t.payment_method && t.card_id) && '💳'}
                        {(!t.payment_method && !t.card_id && t.type !== 'transfer') && '🏦'}
                        {t.type === 'transfer' && '🔄'}
                    </Box>
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem', color: 'text.primary', opacity: t.is_paid ? 1 : 0.6 }}>
                            {t.payment_method === 'money' && 'Dinheiro'}
                            {t.payment_method === 'debit' && 'Débito'}
                            {t.payment_method === 'credit' && 'Crédito'}
                            {t.payment_method === 'pix' && 'PIX'}
                            {t.type === 'transfer' && 'Transferência'}
                            {!t.payment_method && (t.card_id ? 'Cartão' : 'Conta')}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.7rem' }}>
                            {t.type === 'transfer' ?
                                `${t.bank_account?.name} → ${t.to_bank_account?.name}` :
                                (t.credit_card?.name || t.bank_account?.name || '-')}
                        </Typography>
                    </Box>
                </Stack>
            </TableCell>
            <TableCell align="right">
                {renderPrice(t.amount, t.type)}
            </TableCell>
            <TableCell align="right" sx={{ width: 48 }}>
                <IconButton size="small" onClick={(e) => handleOpenMenu(e, t)}>
                    <MoreVertical size={16} />
                </IconButton>
            </TableCell>
        </TableRow>
    );
}
