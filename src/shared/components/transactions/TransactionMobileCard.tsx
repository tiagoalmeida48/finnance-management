import { Box, Stack, Typography, Chip, IconButton, Collapse, Checkbox } from '@mui/material';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, ArrowRightLeft, MoreVertical, ChevronDown, CheckCircle2, Clock } from 'lucide-react';
import { Transaction } from '../../services/transactions.service';
import { colors } from '@/shared/theme';
import { TransactionGroup } from '../../hooks/transactionsPage.utils';
import { Fragment, useState } from 'react';

interface TransactionMobileCardProps {
    item: Transaction | TransactionGroup;
    selectedIds: string[];
    handleSelectRow: (id: string) => void;
    handleTogglePaid: (t: Transaction) => void;
    handleOpenMenu: (e: React.MouseEvent<HTMLElement>, t: Transaction) => void;
    isPendingToggle?: (id: string) => boolean;
}

export function TransactionMobileCard({
    item,
    selectedIds,
    handleSelectRow,
    handleTogglePaid,
    handleOpenMenu,
    isPendingToggle
}: TransactionMobileCardProps) {
    const [expanded, setExpanded] = useState(false);

    // Check if it is a group
    const isGroup = 'isGroup' in item && item.isGroup;
    const group = isGroup ? (item as TransactionGroup) : null;
    const transaction = isGroup ? group!.mainTransaction : (item as Transaction);

    // Derived state for selection
    const isSelected = isGroup
        ? group!.items.every(it => selectedIds.includes(it.id))
        : selectedIds.includes(transaction.id);

    const toggleSelection = () => {
        if (isGroup) {
            group!.items.forEach(it => {
                if (!isSelected && !selectedIds.includes(it.id)) handleSelectRow(it.id);
                if (isSelected && selectedIds.includes(it.id)) handleSelectRow(it.id);
            });
        } else {
            handleSelectRow(transaction.id);
        }
    };

    const formatBRL = (amount: number) => new Intl.NumberFormat('pt-BR', {
        style: 'currency', currency: 'BRL'
    }).format(amount);

    const getTypeConfig = (type: string) => {
        switch (type) {
            case 'income': return { icon: TrendingUp, color: colors.green, bgColor: colors.greenBg };
            case 'expense': return { icon: TrendingDown, color: colors.red, bgColor: colors.redBg };
            default: return { icon: ArrowRightLeft, color: colors.yellow, bgColor: colors.yellowBg };
        }
    };

    const typeConfig = getTypeConfig(transaction.type);
    const TypeIcon = typeConfig.icon;
    const displayAmount = isGroup ? group!.totalAmount : transaction.amount;
    const isPaid = isGroup ? group!.isAllPaid : transaction.is_paid;

    return (
        <Box sx={{
            bgcolor: colors.bgCard,
            borderRadius: '12px',
            border: `1px solid ${colors.border}`,
            p: 2,
            position: 'relative',
        }}>
            <Stack spacing={1.5}>
                {/* Header: Date + Status Badge */}
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ fontSize: '12px', color: colors.textSecondary }}>
                        {format(new Date(transaction.payment_date + 'T12:00:00'), 'dd/MM/yyyy')}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                        {!isGroup && !transaction.card_id && (
                            <Box
                                onClick={(e) => { e.stopPropagation(); handleTogglePaid(transaction); }}
                                sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }}
                            >
                                {isPaid ? <CheckCircle2 size={14} color={colors.accent} /> : <Clock size={14} color={colors.textMuted} />}
                                <Typography sx={{ fontSize: '11px', color: isPaid ? colors.accent : colors.textMuted }}>
                                    {isPaid ? 'Pago' : 'Pendente'}
                                </Typography>
                            </Box>
                        )}
                        {isGroup && (
                            <Chip
                                label={`${group!.paidItemsCount}/${group!.totalItemsCount} Pagos`}
                                size="small"
                                sx={{ height: 20, fontSize: '10px', bgcolor: 'rgba(255,255,255,0.05)', color: colors.textSecondary }}
                            />
                        )}
                    </Stack>
                </Stack>

                {/* Main Content: Icon + Desc + Amount */}
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Box sx={{
                        width: 40, height: 40, borderRadius: '10px',
                        bgcolor: typeConfig.bgColor, color: typeConfig.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <TypeIcon size={20} />
                    </Box>

                    <Box sx={{ flexGrow: 1 }}>
                        <Typography sx={{ fontSize: '14px', fontWeight: 600, color: colors.textPrimary, lineHeight: 1.3, mb: 0.5 }}>
                            {transaction.description}
                        </Typography>

                        <Stack direction="row" alignItems="center" flexWrap="wrap" gap={0.5}>
                            {transaction.category?.name && (
                                <Chip
                                    label={transaction.category.name}
                                    size="small"
                                    sx={{
                                        height: 20, fontSize: '10px', fontWeight: 600,
                                        bgcolor: transaction.category.color ? `${transaction.category.color}15` : 'rgba(255,255,255,0.05)',
                                        color: transaction.category.color || colors.textSecondary
                                    }}
                                />
                            )}
                            {isGroup && (
                                <Chip
                                    label={group!.type === 'installment' ? 'Parcelado' : 'Recorrente'}
                                    size="small"
                                    sx={{ height: 20, fontSize: '10px', bgcolor: colors.purpleBg, color: colors.purple }}
                                />
                            )}
                        </Stack>

                        <Typography sx={{
                            fontSize: '16px', fontWeight: 700,
                            color: isPaid ? colors.textPrimary : typeConfig.color,
                            mt: 1
                        }}>
                            {formatBRL(displayAmount)}
                        </Typography>
                    </Box>

                    {/* Actions */}
                    <Stack direction="column" spacing={1} alignItems="flex-end">
                        <IconButton
                            size="small"
                            onClick={(e) => handleOpenMenu(e, transaction)}
                            sx={{ color: colors.textMuted }}
                        >
                            <MoreVertical size={18} />
                        </IconButton>

                        <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={toggleSelection}
                            sx={{
                                p: 0.5,
                                color: colors.border,
                                '&.Mui-checked': { color: colors.accent }
                            }}
                        />
                    </Stack>
                </Stack>

                {/* Group Expansion */}
                {isGroup && (
                    <Box>
                        <Box
                            onClick={() => setExpanded(!expanded)}
                            sx={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                pt: 1, borderTop: `1px solid ${colors.border}`, mt: 1,
                                color: colors.textSecondary, cursor: 'pointer'
                            }}
                        >
                            <Typography sx={{ fontSize: '12px', mr: 0.5 }}>
                                {expanded ? 'Ocultar parcelas' : `Ver ${group!.items.length} parcelas`}
                            </Typography>
                            <ChevronDown size={14} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                        </Box>

                        <Collapse in={expanded}>
                            <Stack spacing={1} sx={{ mt: 2 }}>
                                {group!.items.map(subItem => (
                                    <TransactionMobileCard
                                        key={subItem.id}
                                        item={subItem}
                                        selectedIds={selectedIds}
                                        handleSelectRow={handleSelectRow}
                                        handleTogglePaid={handleTogglePaid}
                                        handleOpenMenu={handleOpenMenu}
                                        isPendingToggle={isPendingToggle}
                                    />
                                ))}
                            </Stack>
                        </Collapse>
                    </Box>
                )}
            </Stack>
        </Box>
    );
}
