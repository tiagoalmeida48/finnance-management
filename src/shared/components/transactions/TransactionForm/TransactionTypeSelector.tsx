import { Box } from '@mui/material';
import { Controller, type Control } from 'react-hook-form';
import type { TransactionType } from '@/shared/interfaces';
import { colors } from '@/shared/theme';
import type { TransactionFormValues } from '@/shared/hooks/useTransactionFormLogic';
import { getTypeConfig } from './transactionFormStyles';

interface TransactionTypeSelectorProps {
    control: Control<TransactionFormValues>;
}

const transactionTypes: TransactionType[] = ['expense', 'income', 'transfer'];

export function TransactionTypeSelector({ control }: TransactionTypeSelectorProps) {
    return (
        <Controller
            name="type"
            control={control}
            render={({ field }) => (
                <Box
                    sx={{
                        display: 'flex',
                        gap: 0.5,
                        bgcolor: 'rgba(255,255,255,0.04)',
                        borderRadius: '10px',
                        p: '3px',
                        mb: 2.5,
                    }}
                >
                    {transactionTypes.map((type) => {
                        const config = getTypeConfig(type);
                        const isActive = field.value === type;

                        return (
                            <Box
                                key={type}
                                component="button"
                                type="button"
                                onClick={() => field.onChange(type)}
                                sx={{
                                    flex: 1,
                                    py: 1.25,
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontFamily: '"DM Sans"',
                                    fontWeight: isActive ? 600 : 500,
                                    bgcolor: isActive ? config.bgColor : 'transparent',
                                    color: isActive ? config.color : colors.textSecondary,
                                    transition: 'all 200ms ease',
                                    '&:hover': {
                                        bgcolor: isActive ? config.bgColor : 'rgba(255,255,255,0.04)',
                                    },
                                }}
                            >
                                {config.label}
                            </Box>
                        );
                    })}
                </Box>
            )}
        />
    );
}
