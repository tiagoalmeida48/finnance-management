import type { AccountType, TransactionType } from '@/shared/interfaces';
import { colors } from '@/shared/theme';
import type { LucideIcon } from 'lucide-react';
import {
    Car,
    CreditCard as CardIcon,
    Dumbbell,
    Globe,
    GraduationCap,
    Heart,
    Home,
    Landmark,
    Layers,
    Percent,
    RefreshCw,
    ShoppingCart,
    Smartphone,
    Tag,
    Utensils,
    Wallet,
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

export const getAccountIcon = (type: AccountType) => {
    switch (type) {
        case 'checking':
            return Landmark;
        case 'savings':
            return Wallet;
        default:
            return CardIcon;
    }
};

export const getTypeConfig = (type: TransactionType) => {
    switch (type) {
        case 'expense':
            return { color: colors.red, bgColor: 'rgba(239, 68, 68, 0.15)', label: 'Despesa' };
        case 'income':
            return { color: colors.green, bgColor: 'rgba(16, 185, 129, 0.15)', label: 'Receita' };
        default:
            return { color: colors.blue, bgColor: 'rgba(59, 130, 246, 0.15)', label: 'Transferência' };
    }
};

export const toggleConfig = {
    recurring: { icon: RefreshCw, activeColor: colors.blue, label: 'Recorrente' },
    installment: { icon: Layers, activeColor: colors.purple, label: 'Parcelar' },
};

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

export const modernDateInputSx = {
    '& .MuiOutlinedInput-root': {
        height: 44,
        borderRadius: '12px',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.015) 100%)',
        '& fieldset': { borderColor: 'rgba(255,255,255,0.14)' },
        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.24)' },
        '&.Mui-focused fieldset': { borderColor: colors.accent },
    },
    '& .MuiSvgIcon-root': {
        color: colors.accent,
    },
    '& .MuiIconButton-root:hover': {
        backgroundColor: 'rgba(201, 168, 76, 0.14)',
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
    borderBottom: '1px solid rgba(255,255,255,0.04)',
};

export const selectMenuPaperSx = {
    bgcolor: colors.bgCardHover,
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
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
        bgcolor: 'rgba(255,255,255,0.12)',
        borderRadius: '4px',
        '&:hover': {
            bgcolor: 'rgba(201, 168, 76, 0.5)',
        },
    },
    scrollbarWidth: 'thin',
    scrollbarColor: 'rgba(255,255,255,0.12) transparent',
};
