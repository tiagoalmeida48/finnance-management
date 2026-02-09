import { FormControl, FormHelperText, MenuItem, Select, Stack, Typography } from '@mui/material';
import { Landmark, Wallet, CreditCard as CardIcon, Briefcase, PiggyBank } from 'lucide-react';
import type { Account } from '../../interfaces/account.interface';
import { colors } from '@/shared/theme';
import { inputStyles } from './cardFormStyles';

const getAccountIcon = (type: string, iconColor: string) => {
    switch (type) {
        case 'checking': return <Landmark size={16} color={iconColor} />;
        case 'savings': return <PiggyBank size={16} color={iconColor} />;
        case 'investment': return <Briefcase size={16} color={iconColor} />;
        case 'wallet': return <Wallet size={16} color={iconColor} />;
        default: return <CardIcon size={16} color={iconColor} />;
    }
};

interface CardLinkedAccountSelectProps {
    accounts: Account[] | undefined;
    value: string;
    onChange: (value: string) => void;
    errorMessage?: string;
}

export function CardLinkedAccountSelect({ accounts, value, onChange, errorMessage }: CardLinkedAccountSelectProps) {
    return (
        <FormControl fullWidth error={Boolean(errorMessage)}>
            <Select
                value={value}
                onChange={(event) => onChange(String(event.target.value))}
                displayEmpty
                sx={{
                    ...inputStyles['& .MuiOutlinedInput-root'],
                    '& .MuiSelect-icon': { color: colors.textMuted }
                }}
                renderValue={(selected) => {
                    if (!selected) {
                        return <Typography sx={{ color: colors.textMuted }}>Selecione...</Typography>;
                    }
                    const account = accounts?.find((item) => item.id === selected);
                    if (!account) return selected;
                    return (
                        <Stack direction="row" spacing={1} alignItems="center">
                            {getAccountIcon(account.type, account.color || colors.textMuted)}
                            <Typography sx={{ color: colors.textPrimary }}>{account.name}</Typography>
                        </Stack>
                    );
                }}
            >
                <MenuItem value="" disabled>
                    <Typography sx={{ color: colors.textMuted }}>Selecione...</Typography>
                </MenuItem>
                {accounts?.map((account) => (
                    <MenuItem key={account.id} value={account.id}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            {getAccountIcon(account.type, account.color || colors.textMuted)}
                            <Typography>{account.name}</Typography>
                        </Stack>
                    </MenuItem>
                ))}
            </Select>
            {errorMessage && <FormHelperText>{errorMessage}</FormHelperText>}
        </FormControl>
    );
}
