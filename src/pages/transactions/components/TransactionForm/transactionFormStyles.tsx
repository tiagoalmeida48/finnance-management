import type { TransactionType } from '@/shared/interfaces';
import { colors } from '@/shared/theme';
import { messages } from '@/shared/i18n/messages';
import type { LucideIcon } from 'lucide-react';
import {
    Car,
    Dumbbell,
    Globe,
    GraduationCap,
    Heart,
    Home,
    Layers,
    Percent,
    RefreshCw,
    ShoppingCart,
    Smartphone,
    Tag,
    Utensils,
    Zap,
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, LucideIcon> = {
    moradia: Home,
    mercado: ShoppingCart,
    transporte: Car,
    saude: Heart,
    'saúde': Heart,
    telefonia: Smartphone,
    internet: Globe,
    cursos: GraduationCap,
    'inteligencia artificial': Zap,
    'inteligência artificial': Zap,
    restaurante: Utensils,
    academia: Dumbbell,
    taxas: Percent,
    default: Tag,
};

export const getCategoryIcon = (name: string) =>
    CATEGORY_ICONS[name.toLowerCase()] ?? CATEGORY_ICONS.default;

export { getAccountTypeIcon as getAccountIcon } from '@/shared/constants/accountTypes';

export const getTypeConfig = (type: TransactionType) => {
    switch (type) {
        case 'expense':
            return { color: colors.red, bgColor: 'var(--overlay-error-15)', label: messages.transactions.form.type.expense };
        case 'income':
            return { color: colors.green, bgColor: 'var(--overlay-success-15)', label: messages.transactions.form.type.income };
        default:
            return { color: colors.blue, bgColor: 'var(--overlay-info-15)', label: messages.transactions.form.type.transfer };
    }
};

export const toggleConfig = {
    recurring: { icon: RefreshCw, activeColor: colors.blue, label: messages.transactions.form.toggles.recurring },
    installment: { icon: Layers, activeColor: colors.purple, label: messages.transactions.form.toggles.installment },
};

export const inputStyles = {
    '& .MuiOutlinedInput-root': {
        height: 44,
        borderRadius: '10px',
        bgcolor: 'var(--overlay-white-03)',
        fontSize: '14px',
        fontFamily: '"DM Sans"',
        '& fieldset': { borderColor: 'var(--overlay-white-06)' },
        '&:hover fieldset': { borderColor: 'var(--overlay-white-12)' },
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

export const modernDateInputSx = {
    '& .MuiOutlinedInput-root': {
        height: 44,
        borderRadius: '12px',
        background: 'linear-gradient(135deg, var(--overlay-white-03) 0%, var(--overlay-white-015) 100%)',
        '& fieldset': { borderColor: 'var(--overlay-white-14)' },
        '&:hover fieldset': { borderColor: 'var(--overlay-white-24)' },
        '&.Mui-focused fieldset': { borderColor: colors.accent },
    },
    '& .MuiSvgIcon-root': {
        color: colors.accent,
    },
    '& .MuiIconButton-root:hover': {
        backgroundColor: 'var(--overlay-primary-14)',
    },
};

export const datePickerPopperSx = {
    '& .MuiPaper-root': {
        borderRadius: '14px',
        border: `1px solid ${colors.border}`,
        backgroundColor: colors.bgCard,
    },
    '& .MuiPickersLayout-actionBar': {
        display: 'none',
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

export const sectionLabel = {
    fontSize: '11px',
    fontFamily: '"DM Sans"',
    fontWeight: 600,
    color: colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    mb: 1.5,
    pb: 1,
    borderBottom: '1px solid var(--overlay-white-04)',
};

export const selectMenuPaperSx = {
    bgcolor: colors.bgCardHover,
    border: '1px solid var(--overlay-white-08)',
    borderRadius: '10px',
    boxShadow: '0 8px 32px var(--overlay-black-40)',
    mt: 0.5,
};

export const scrollableSelectMenuPaperSx = {
    ...selectMenuPaperSx,
    maxHeight: 280,
    '&::-webkit-scrollbar': {
        width: '4px',
    },
    '&::-webkit-scrollbar-track': {
        bgcolor: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
        bgcolor: 'var(--overlay-white-12)',
        borderRadius: '4px',
        '&:hover': {
            bgcolor: 'var(--overlay-primary-50)',
        },
    },
    scrollbarWidth: 'thin',
    scrollbarColor: 'var(--overlay-white-12) transparent',
};

