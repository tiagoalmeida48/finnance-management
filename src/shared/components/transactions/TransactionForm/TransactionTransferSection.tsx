import { Box, FormControl, MenuItem, Select, Typography } from '@mui/material';
import type { Account, Transaction } from '@/shared/interfaces';
import type { TransactionFormValues } from '@/shared/hooks/useTransactionFormLogic';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { colors } from '@/shared/theme';
import { getAccountIcon, inputStyles, labelStyles, sectionLabel } from './transactionFormStyles';
import { TransactionDateField } from './TransactionDateField';
import type { Control } from 'react-hook-form';

interface TransactionTransferSectionProps {
    isMobile: boolean;
    transaction?: Transaction;
    accounts: Account[];
    errors: FieldErrors<TransactionFormValues>;
    register: UseFormRegister<TransactionFormValues>;
    control: Control<TransactionFormValues>;
}

export function TransactionTransferSection({
    isMobile,
    transaction,
    accounts,
    errors,
    register,
    control,
}: TransactionTransferSectionProps) {
    return (
        <Box sx={{ mb: 2 }}>
            <Typography sx={sectionLabel}>Transferência</Typography>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
                    gap: 1.5,
                }}
            >
                <Box>
                    <Typography sx={labelStyles}>Origem *</Typography>
                    <FormControl fullWidth error={Boolean(errors.account_id)}>
                        <Select
                            {...register('account_id')}
                            defaultValue={transaction?.account_id || ''}
                            displayEmpty
                            sx={{
                                ...inputStyles['& .MuiOutlinedInput-root'],
                                '& .MuiSelect-icon': { color: colors.textMuted },
                            }}
                        >
                            <MenuItem value="" disabled>
                                Selecione...
                            </MenuItem>
                            {accounts.map((account) => {
                                const AccountIcon = getAccountIcon(account.type);
                                return (
                                    <MenuItem key={account.id} value={account.id} sx={{ fontSize: '13px' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <AccountIcon size={18} color={account.color} />
                                            {account.name}
                                        </Box>
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>
                </Box>
                <Box>
                    <Typography sx={labelStyles}>Destino *</Typography>
                    <FormControl fullWidth error={Boolean(errors.to_account_id)}>
                        <Select
                            {...register('to_account_id')}
                            defaultValue={transaction?.to_account_id || ''}
                            displayEmpty
                            sx={{
                                ...inputStyles['& .MuiOutlinedInput-root'],
                                '& .MuiSelect-icon': { color: colors.textMuted },
                            }}
                        >
                            <MenuItem value="" disabled>
                                Selecione...
                            </MenuItem>
                            {accounts.map((account) => {
                                const AccountIcon = getAccountIcon(account.type);
                                return (
                                    <MenuItem key={account.id} value={account.id} sx={{ fontSize: '13px' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <AccountIcon size={18} color={account.color} />
                                            {account.name}
                                        </Box>
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>
                </Box>
                <Box>
                    <Typography sx={labelStyles}>Data *</Typography>
                    <TransactionDateField control={control} />
                </Box>
            </Box>
        </Box>
    );
}
