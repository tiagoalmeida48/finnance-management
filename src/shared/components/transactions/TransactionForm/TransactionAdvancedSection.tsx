import { Box, Collapse, Stack, Switch, TextField, Typography } from '@mui/material';
import { InstallmentGrid } from './InstallmentGrid';
import { colors } from '@/shared/theme';
import type { Transaction } from '@/shared/interfaces';
import type { TransactionFormValues } from '@/shared/hooks/useTransactionFormLogic';
import type { FieldArrayWithId, UseFormRegister } from 'react-hook-form';
import { labelStyles, toggleConfig } from './transactionFormStyles';

interface TransactionAdvancedSectionProps {
    isFixed: boolean;
    isInstallment: boolean;
    amount: number;
    totalInstallments: number;
    transaction?: Transaction;
    applyToGroup: boolean;
    setApplyToGroup: (value: boolean) => void;
    showInstallmentGrid: boolean;
    setShowInstallmentGrid: (value: boolean) => void;
    fields: FieldArrayWithId<TransactionFormValues, 'installments', 'id'>[];
    register: UseFormRegister<TransactionFormValues>;
}

const switchSx = (color: string) => ({
    width: 40,
    height: 22,
    p: 0,
    '& .MuiSwitch-switchBase': {
        p: '3px',
        '&.Mui-checked': {
            transform: 'translateX(18px)',
            '& + .MuiSwitch-track': { bgcolor: color, opacity: 1 },
        },
    },
    '& .MuiSwitch-thumb': { width: 16, height: 16, bgcolor: '#fff' },
    '& .MuiSwitch-track': { borderRadius: 11, bgcolor: 'rgba(255,255,255,0.1)', opacity: 1 },
});

const toggleCardSx = (isActive: boolean, color: string) => ({
    flex: 1,
    bgcolor: 'rgba(255,255,255,0.03)',
    border: `1px solid ${isActive ? color : 'rgba(255,255,255,0.06)'}`,
    borderRadius: '10px',
    p: 1.5,
    transition: 'all 200ms ease',
    '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
});

export function TransactionAdvancedSection({
    isFixed,
    isInstallment,
    amount,
    totalInstallments,
    transaction,
    applyToGroup,
    setApplyToGroup,
    showInstallmentGrid,
    setShowInstallmentGrid,
    fields,
    register,
}: TransactionAdvancedSectionProps) {
    const RecurringIcon = toggleConfig.recurring.icon;
    const InstallmentIcon = toggleConfig.installment.icon;

    return (
        <Box>
            <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
                <Box sx={toggleCardSx(isFixed, toggleConfig.recurring.activeColor)}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={1} alignItems="center">
                            <RecurringIcon size={16} color={isFixed ? toggleConfig.recurring.activeColor : colors.textMuted} />
                            <Typography
                                sx={{
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    color: isFixed ? colors.textPrimary : colors.textSecondary,
                                }}
                            >
                                {toggleConfig.recurring.label}
                            </Typography>
                        </Stack>
                        <Switch {...register('is_fixed')} size="small" sx={switchSx(toggleConfig.recurring.activeColor)} />
                    </Stack>
                </Box>

                <Box sx={toggleCardSx(isInstallment, toggleConfig.installment.activeColor)}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={1} alignItems="center">
                            <InstallmentIcon size={16} color={isInstallment ? toggleConfig.installment.activeColor : colors.textMuted} />
                            <Typography
                                sx={{
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    color: isInstallment ? colors.textPrimary : colors.textSecondary,
                                }}
                            >
                                {toggleConfig.installment.label}
                            </Typography>
                        </Stack>
                        <Switch
                            {...register('is_installment')}
                            size="small"
                            sx={switchSx(toggleConfig.installment.activeColor)}
                        />
                    </Stack>
                </Box>
            </Stack>

            <Collapse in={isFixed && !isInstallment && !transaction}>
                <Box sx={{ mb: 2 }}>
                    <Typography sx={labelStyles}>Repetir por quantos meses?</Typography>
                    <TextField
                        fullWidth
                        size="small"
                        type="number"
                        placeholder="12"
                        {...register('repeat_count')}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '10px',
                                bgcolor: 'rgba(255,255,255,0.03)',
                            },
                        }}
                    />
                </Box>
            </Collapse>

            <Collapse in={isInstallment}>
                <Stack spacing={2} sx={{ mb: 2 }}>
                    <Box>
                        <Typography sx={labelStyles}>Número de Parcelas</Typography>
                        <TextField
                            fullWidth
                            size="small"
                            type="number"
                            placeholder="12"
                            {...register('total_installments')}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '10px',
                                    bgcolor: 'rgba(255,255,255,0.03)',
                                },
                            }}
                        />
                        {amount > 0 && totalInstallments > 0 && (
                            <Typography sx={{ fontSize: '12px', color: colors.accent, mt: 0.5 }}>
                                {totalInstallments}x de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount / totalInstallments)}
                            </Typography>
                        )}
                    </Box>
                    <InstallmentGrid
                        show={showInstallmentGrid}
                        setShow={setShowInstallmentGrid}
                        fields={fields}
                        register={register}
                    />
                </Stack>
            </Collapse>

            {transaction && (transaction.installment_group_id || transaction.recurring_group_id) && (
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography sx={{ fontSize: '13px', color: colors.textSecondary }}>
                        Aplicar a todo o grupo
                    </Typography>
                    <Switch
                        checked={applyToGroup}
                        onChange={(event) => setApplyToGroup(event.target.checked)}
                        size="small"
                        sx={switchSx(colors.accent)}
                    />
                </Stack>
            )}
        </Box>
    );
}
