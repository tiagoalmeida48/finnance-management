import { Button, CircularProgress, DialogActions } from '@mui/material';
import { colors } from '@/shared/theme';

interface TransactionFormActionsProps {
    isSubmitting: boolean;
    submitLabel: string;
    onClose: () => void;
}

export function TransactionFormActions({ isSubmitting, submitLabel, onClose }: TransactionFormActionsProps) {
    return (
        <DialogActions
            sx={{
                px: 3,
                py: 2,
                borderTop: '1px solid rgba(255,255,255,0.04)',
                justifyContent: 'flex-end',
                gap: 1.5,
            }}
        >
            <Button
                type="button"
                onClick={onClose}
                sx={{
                    px: 3,
                    py: 1.25,
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: colors.textSecondary,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.04)', color: colors.textPrimary },
                }}
            >
                Cancelar
            </Button>
            <Button
                type="submit"
                disabled={isSubmitting}
                sx={{
                    px: 3,
                    py: 1.25,
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 600,
                    bgcolor: colors.accent,
                    color: colors.bgPrimary,
                    boxShadow: '0 2px 8px rgba(201, 168, 76, 0.25)',
                    transition: 'all 200ms ease',
                    '&:hover': {
                        bgcolor: '#D4B85C',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 16px rgba(201, 168, 76, 0.3)',
                    },
                    '&:active': { transform: 'translateY(0)' },
                    '&.Mui-disabled': { opacity: 0.5, bgcolor: colors.accent, color: colors.bgPrimary },
                }}
            >
                {isSubmitting && <CircularProgress size={16} sx={{ mr: 1, color: colors.bgPrimary }} />}
                {submitLabel}
            </Button>
        </DialogActions>
    );
}
