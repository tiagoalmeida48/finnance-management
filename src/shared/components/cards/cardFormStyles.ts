import { colors } from '@/shared/theme';

export const inputStyles = {
    '& .MuiOutlinedInput-root': {
        height: 44,
        borderRadius: '10px',
        bgcolor: 'rgba(255,255,255,0.03)',
        fontSize: '14px',
        fontFamily: '"DM Sans"',
        '& fieldset': { borderColor: 'rgba(255,255,255,0.06)' },
        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
        '&.Mui-focused fieldset': {
            borderColor: colors.accent,
            borderWidth: '1px',
        },
    },
    '& .MuiInputBase-input': {
        color: colors.textPrimary,
        '&::placeholder': { color: colors.textMuted, opacity: 1 },
    },
};

export const labelStyles = {
    fontSize: '11px',
    fontFamily: '"DM Sans"',
    fontWeight: 500,
    color: colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
    mb: 0.75,
};
