import { format } from 'date-fns';
import { TableRow, TableCell, Checkbox, Tooltip, Box, Stack, Typography, Chip, IconButton } from '@mui/material';
import { Clock, CheckCircle2, CreditCard, TrendingUp, TrendingDown, ArrowRightLeft, RefreshCw, MoreVertical, Landmark } from 'lucide-react';
import { Transaction } from '../../services/transactions.service';
import { colors } from '@/shared/theme';

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
    isPendingToggle,
}: TransactionRowProps) {
    const formatBRL = (amount: number) => (
        new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
        }).format(amount)
    );

    const isBillPayment = t.payment_method === 'bill_payment';

    const getTypeConfig = (type: string) => {
        if (isBillPayment) {
            return { icon: Landmark, color: colors.accent, bgColor: 'rgba(201,168,76,0.14)' };
        }

        switch (type) {
            case 'income':
                return { icon: TrendingUp, color: colors.green, bgColor: colors.greenBg };
            case 'expense':
                return { icon: TrendingDown, color: colors.red, bgColor: colors.redBg };
            default:
                return { icon: ArrowRightLeft, color: colors.yellow, bgColor: colors.yellowBg };
        }
    };

    const typeConfig = getTypeConfig(t.type);
    const TypeIcon = typeConfig.icon;
    const dateToDisplay = (t.type === 'expense' && !isBillPayment)
        ? (t.purchase_date || t.payment_date)
        : (t.payment_date || t.purchase_date);
    const amountColor = isBillPayment
        ? (t.is_paid ? colors.green : colors.accent)
        : typeConfig.color;
    const amountPrefix = t.type === 'expense' && !isBillPayment ? '-' : '';
    return (
        <TableRow sx={{
            minHeight: 56,
            borderBottom: `1px solid ${colors.border}`,
            transition: 'all 150ms ease',
            '&:hover': { bgcolor: colors.bgCardHover },
            bgcolor: selectedIds.includes(t.id) ? '#2A2211' : isChild ? colors.bgSecondary : colors.bgCard,
            opacity: isPendingToggle ? 0.6 : 1,
        }}>
            <TableCell padding="checkbox" sx={{ pl: 2 }}>
                <Checkbox
                    size="small"
                    checked={selectedIds.includes(t.id)}
                    onChange={() => handleSelectRow(t.id)}
                    sx={{
                        width: 18,
                        height: 18,
                        '& .MuiSvgIcon-root': { fontSize: 18 },
                        color: 'rgba(255,255,255,0.15)',
                        '&.Mui-checked': { color: colors.accent },
                    }}
                />
            </TableCell>
            <TableCell sx={{ width: 48, py: 1.5 }}>
                {!t.card_id ? (
                    <Checkbox
                        size="small"
                        checked={t.is_paid}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePaid(t);
                        }}
                        icon={<Clock size={16} color={colors.textMuted} />}
                        checkedIcon={<CheckCircle2 size={16} color={colors.accent} />}
                        sx={{ p: 0.5 }}
                    />
                ) : (
                    <Tooltip title="Pago via fatura">
                        <Box sx={{ p: 0.5, display: 'flex', justifyContent: 'center' }}>
                            <CreditCard size={16} color={colors.textMuted} />
                        </Box>
                    </Tooltip>
                )}
            </TableCell>
            <TableCell sx={{ width: 100, py: 1.75 }}>
                <Typography sx={{
                    fontSize: '13px',
                    color: colors.textSecondary,
                    fontFamily: '"DM Sans"',
                }}>
                    {dateToDisplay ? format(new Date(`${dateToDisplay}T12:00:00`), 'dd/MM/yyyy') : '-'}
                </Typography>
            </TableCell>
            <TableCell sx={{ py: 1.75 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    {!isChild && (
                        <Box sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '8px',
                            bgcolor: typeConfig.bgColor,
                            color: typeConfig.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}>
                            <TypeIcon size={16} />
                        </Box>
                    )}
                    {isChild && <Box sx={{ width: 32 }} />}
                    <Box sx={{ opacity: t.is_paid ? 1 : 0.7 }}>
                        <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
                            <Typography sx={{
                                fontSize: '14px',
                                fontWeight: 500,
                                color: colors.textPrimary,
                            }}>
                                {t.description}
                            </Typography>
                            {t.installment_number && (
                                <Chip
                                    label={`${t.installment_number}/${t.total_installments}`}
                                    size="small"
                                    sx={{
                                        height: 20,
                                        fontSize: '13px',
                                        fontWeight: 700,
                                        borderRadius: '4px',
                                        bgcolor: colors.purpleBg,
                                        color: colors.purple,
                                    }}
                                />
                            )}
                            {!t.is_paid && (
                                <Chip
                                    label="Pendente"
                                    size="small"
                                    sx={{
                                        height: 18,
                                        fontSize: '10px',
                                        fontWeight: 600,
                                        borderRadius: '4px',
                                        bgcolor: colors.yellowBg,
                                        color: colors.yellow,
                                    }}
                                />
                            )}
                            {t.is_fixed && (
                                <Tooltip title="Recorrente">
                                    <RefreshCw size={12} color={colors.textMuted} />
                                </Tooltip>
                            )}
                        </Stack>
                        <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                            {t.is_fixed && (
                                <Chip
                                    label="Recorrente"
                                    size="small"
                                    sx={{
                                        height: 18,
                                        fontSize: '10px',
                                        fontWeight: 600,
                                        borderRadius: '4px',
                                        bgcolor: 'rgba(59, 130, 246, 0.1)',
                                        color: '#3B82F6',
                                    }}
                                />
                            )}
                        </Stack>
                    </Box>
                </Stack>
            </TableCell>
            <TableCell sx={{ py: 1.75, verticalAlign: 'top' }}>
                {!isChild && (
                    <Box sx={{ minHeight: 24, display: 'flex', alignItems: 'flex-start' }}>
                        {t.type !== 'transfer' ? (
                            isBillPayment ? (
                                <Chip
                                    label="Pagamento Fatura"
                                    size="small"
                                    sx={{
                                        height: 22,
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        borderRadius: '6px',
                                        bgcolor: 'rgba(201,168,76,0.14)',
                                        color: colors.accent,
                                    }}
                                />
                            ) : t.category?.name ? (
                                <Chip
                                    label={t.category.name}
                                    size="small"
                                    sx={{
                                        height: 22,
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        borderRadius: '6px',
                                        bgcolor: t.category?.color ? `${t.category.color}15` : 'rgba(255,255,255,0.05)',
                                        color: t.category?.color || colors.textSecondary,
                                        opacity: t.is_paid ? 1 : 0.7,
                                    }}
                                />
                            ) : (
                                <Chip
                                    label="Sem categoria"
                                    size="small"
                                    sx={{
                                        height: 20,
                                        fontSize: '11px',
                                        borderRadius: '4px',
                                        bgcolor: 'rgba(255,255,255,0.03)',
                                        color: colors.textMuted,
                                    }}
                                />
                            )
                        ) : (
                            <Chip
                                label="Transferência"
                                size="small"
                                sx={{
                                    height: 20,
                                    fontSize: '11px',
                                    borderRadius: '4px',
                                    bgcolor: colors.yellowBg,
                                    color: colors.yellow,
                                }}
                            />
                        )}
                    </Box>
                )}
            </TableCell>
            <TableCell sx={{ py: 1.75, verticalAlign: 'top' }}>
                {!isChild && (
                    <Box sx={{ minHeight: 24 }}>
                        <Typography sx={{
                            fontSize: '13px',
                            fontWeight: 500,
                            color: colors.textPrimary,
                            lineHeight: '22px',
                            opacity: t.is_paid ? 1 : 0.7,
                        }}>
                            {t.payment_method === 'money' && 'Dinheiro'}
                            {t.payment_method === 'debit' && 'Débito'}
                            {t.payment_method === 'credit' && 'Crédito'}
                            {t.payment_method === 'pix' && 'PIX'}
                            {t.payment_method === 'bill_payment' && 'Pagamento Fatura'}
                            {t.type === 'transfer' && 'Transferência'}
                            {!t.payment_method && (t.card_id ? 'Cartão' : 'Conta')}
                        </Typography>
                        <Typography sx={{
                            fontSize: '11px',
                            lineHeight: 1.2,
                            color: t.credit_card?.color || colors.textMuted,
                            opacity: t.is_paid ? 1 : 0.7,
                        }}>
                            {t.type === 'transfer'
                                ? `${t.bank_account?.name} → ${t.to_bank_account?.name}`
                                : (t.credit_card?.name || t.bank_account?.name || '')}
                        </Typography>
                    </Box>
                )}
            </TableCell>
            <TableCell sx={{ py: 1.75 }}>
                <Typography sx={{ fontSize: '11px', color: colors.textMuted }}>
                    -
                </Typography>
            </TableCell>
            <TableCell align="right" sx={{ py: 1.75 }}>
                <Typography sx={{
                    fontSize: '14px',
                    fontFamily: '"Plus Jakarta Sans"',
                    fontWeight: 600,
                    color: amountColor,
                }}>
                    {amountPrefix}{formatBRL(t.amount)}
                </Typography>
            </TableCell>
            <TableCell align="right" sx={{ width: 48, py: 1.75 }}>
                <IconButton
                    size="small"
                    onClick={(e) => handleOpenMenu(e, t)}
                    sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '6px',
                        color: colors.textMuted,
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
                    }}
                >
                    <MoreVertical size={16} />
                </IconButton>
            </TableCell>
        </TableRow>
    );
}
