import { AlertCircle } from 'lucide-react';
import { Box, TextField, Typography } from '@mui/material';
import type { ChangeEvent } from 'react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { colors } from '@/shared/theme';
import type { TransactionFormValues } from '@/shared/hooks/useTransactionFormLogic';
import { inputStyles, labelStyles } from './transactionFormStyles';

interface TransactionBasicFieldsProps {
    register: UseFormRegister<TransactionFormValues>;
    errors: FieldErrors<TransactionFormValues>;
    isMobile: boolean;
    rawValue: string;
    formatDisplayValue: (raw: string) => string;
    onMoneyInput: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function TransactionBasicFields({
    register,
    errors,
    isMobile,
    rawValue,
    formatDisplayValue,
    onMoneyInput,
}: TransactionBasicFieldsProps) {
    return (
        <Box>
            <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2, mb: 2 }}>
                <Box sx={{ flex: 1.5 }}>
                    <Typography sx={labelStyles}>Descrição *</Typography>
                    <TextField
                        fullWidth
                        placeholder="Ex: Aluguel, Supermercado, Salário..."
                        {...register('description')}
                        error={Boolean(errors.description)}
                        sx={inputStyles}
                    />
                    {errors.description && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                            <AlertCircle size={12} color={colors.red} />
                            <Typography sx={{ fontSize: '11px', color: colors.red }}>
                                {String(errors.description.message ?? '')}
                            </Typography>
                        </Box>
                    )}
                </Box>

                <Box sx={{ flex: 1 }}>
                    <Typography sx={labelStyles}>Valor Total *</Typography>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            height: 44,
                            bgcolor: 'rgba(255,255,255,0.03)',
                            border: `1px solid ${errors.amount ? colors.red : 'rgba(255,255,255,0.06)'}`,
                            borderRadius: '10px',
                            px: 1.5,
                            transition: 'all 200ms ease',
                            '&:focus-within': {
                                borderColor: 'rgba(255,255,255,0.15)',
                                boxShadow: '0 0 0 3px rgba(255,255,255,0.04)',
                            },
                        }}
                    >
                        <Typography sx={{ fontSize: '13px', fontWeight: 500, color: colors.textMuted }}>
                            R$
                        </Typography>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={formatDisplayValue(rawValue)}
                            onChange={onMoneyInput}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                fontSize: '24px',
                                fontFamily: '"Plus Jakarta Sans"',
                                fontWeight: 700,
                                color: colors.textPrimary,
                                textAlign: 'right',
                                width: '100%',
                                marginLeft: 8,
                            }}
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
