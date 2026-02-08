import { useState } from 'react';
import {
    Dialog, DialogContent, DialogActions, Button, TextField, Stack, MenuItem,
    FormControl, Select, Typography, Box, FormHelperText, Switch, Collapse,
    CircularProgress, useMediaQuery, useTheme
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR as pickersPtBR } from '@mui/x-date-pickers/locales';
import {
    Landmark, Wallet, CreditCard as CardIcon, Tag,
    RefreshCw, Layers, Home, ShoppingCart, Car, Heart, Smartphone,
    Globe, GraduationCap, Zap, Utensils, Dumbbell, Percent, AlertCircle
} from 'lucide-react';
import { Controller, useFieldArray } from 'react-hook-form';
import { useTransactionFormLogic } from '../../hooks/useTransactionFormLogic';
import { InstallmentGrid } from './TransactionForm/InstallmentGrid';
import { Transaction } from '../../interfaces/transaction.interface';
import { colors } from '@/shared/theme';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TransactionFormModalProps {
    open: boolean;
    onClose: () => void;
    transaction?: Transaction;
}

const CATEGORY_ICONS: Record<string, typeof Home> = {
    'moradia': Home,
    'mercado': ShoppingCart,
    'transporte': Car,
    'saúde': Heart,
    'saude': Heart,
    'telefonia': Smartphone,
    'internet': Globe,
    'cursos': GraduationCap,
    'inteligência artificial': Zap,
    'inteligencia artificial': Zap,
    'restaurante': Utensils,
    'academia': Dumbbell,
    'taxas': Percent,
    'default': Tag,
};

const getCategoryIcon = (name: string) => {
    const key = name.toLowerCase();
    return CATEGORY_ICONS[key] || CATEGORY_ICONS['default'];
};

const inputStyles = {
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

const modernDateInputSx = {
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

const labelStyles = {
    fontSize: '11px',
    fontFamily: '"DM Sans"',
    fontWeight: 500,
    color: colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
    mb: 0.75,
};

const sectionLabel = {
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

export function TransactionFormModal({ open, onClose, transaction }: TransactionFormModalProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const {
        form, accounts, categories, cards,
        showInstallmentGrid, setShowInstallmentGrid,
        applyToGroup, setApplyToGroup,
        transactionType, paymentMethod, isInstallment, isFixed,
        onSubmit
    } = useTransactionFormLogic(open, onClose, transaction);

    const { register, control, watch, setValue, formState: { errors, isSubmitting } } = form;
    const { fields } = useFieldArray({ control, name: "installments" });

    const amount = watch('amount') || 0;
    const totalInstallments = watch('total_installments') || 1;

    const [rawValue, setRawValue] = useState('0');

    const handleMoneyInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const digits = e.target.value.replace(/\D/g, '');
        setRawValue(digits || '0');
        const numericValue = parseInt(digits || '0', 10) / 100;
        setValue('amount', numericValue);
    };

    const formatDisplayValue = (raw: string) => {
        const numericValue = parseInt(raw || '0', 10) / 100;
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(numericValue);
    };

    const getAccountIcon = (type: string, color: string) => {
        switch (type) {
            case 'checking': return <Landmark size={18} color={color} />;
            case 'savings': return <Wallet size={18} color={color} />;
            default: return <CardIcon size={18} color={color} />;
        }
    };

    const getTypeConfig = (type: string) => {
        switch (type) {
            case 'expense': return { color: colors.red, bgColor: 'rgba(239, 68, 68, 0.15)', label: 'Despesa' };
            case 'income': return { color: colors.green, bgColor: 'rgba(16, 185, 129, 0.15)', label: 'Receita' };
            default: return { color: colors.blue, bgColor: 'rgba(59, 130, 246, 0.15)', label: 'Transferência' };
        }
    };

    const getSubmitLabel = () => {
        if (isSubmitting) return 'Salvando...';
        if (transaction) return 'Salvar';
        const config = getTypeConfig(transactionType);
        return `Criar ${config.label}`;
    };

    const filteredCategories = categories?.filter((c) => c.type === transactionType) || [];

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={false}
            slotProps={{
                paper: {
                    sx: {
                        width: isMobile ? '95vw' : 640,
                        maxWidth: '95vw',
                        bgcolor: colors.bgSecondary,
                        border: `1px solid rgba(255,255,255,0.08)`,
                        borderRadius: '20px',
                        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
                    }
                }
            }}
        >
            <form onSubmit={onSubmit}>
                <LocalizationProvider
                    dateAdapter={AdapterDateFns}
                    adapterLocale={ptBR}
                    localeText={pickersPtBR.components.MuiLocalizationProvider.defaultProps.localeText}
                >
                    <DialogContent sx={{ p: isMobile ? '24px 20px' : '32px 28px' }}>
                    {/* Title */}
                    <Typography sx={{
                        fontSize: '22px',
                        fontFamily: '"Plus Jakarta Sans"',
                        fontWeight: 700,
                        color: colors.textPrimary,
                        mb: 2.5,
                    }}>
                        {transaction ? 'Editar Transação' : 'Nova Transação'}
                    </Typography>

                    {/* Type Tabs */}
                    <Controller
                        name="type"
                        control={control}
                        render={({ field }) => (
                            <Box sx={{
                                display: 'flex',
                                gap: 0.5,
                                bgcolor: 'rgba(255,255,255,0.04)',
                                borderRadius: '10px',
                                p: '3px',
                                mb: 2.5,
                            }}>
                                {(['expense', 'income', 'transfer'] as const).map((type) => {
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

                    {/* ROW 1: Descrição + Valor (side by side) */}
                    <Stack direction={isMobile ? 'column' : 'row'} spacing={2} sx={{ mb: 2 }}>
                        {/* Descrição */}
                        <Box sx={{ flex: 1.5 }}>
                            <Typography sx={labelStyles}>Descrição *</Typography>
                            <TextField
                                fullWidth
                                placeholder="Ex: Aluguel, Supermercado, Salário..."
                                {...register('description')}
                                error={!!errors.description}
                                sx={inputStyles}
                            />
                            {errors.description && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                    <AlertCircle size={12} color={colors.red} />
                                    <Typography sx={{ fontSize: '11px', color: colors.red }}>
                                        {errors.description.message}
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        {/* Valor (smaller, RTL) */}
                        <Box sx={{ flex: 1 }}>
                            <Typography sx={labelStyles}>Valor Total *</Typography>
                            <Box sx={{
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
                            }}>
                                <Typography sx={{ fontSize: '13px', fontWeight: 500, color: colors.textMuted }}>
                                    R$
                                </Typography>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={formatDisplayValue(rawValue)}
                                    onChange={handleMoneyInput}
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
                    </Stack>

                    {/* SECTION: Pagamento */}
                    {transactionType !== 'transfer' && (
                        <Box sx={{ mb: 2 }}>
                            <Typography sx={sectionLabel}>Pagamento</Typography>

                            {/* ROW 2: Forma de Pagamento + Categoria */}
                            <Stack direction={isMobile ? 'column' : 'row'} spacing={2} sx={{ mb: 2 }}>
                                {/* Forma de Pagamento */}
                                <Box sx={{ flex: 1.5 }}>
                                    <Typography sx={labelStyles}>Forma de Pagamento</Typography>
                                    <FormControl fullWidth>
                                        <Select
                                            {...register('payment_method')}
                                            defaultValue="debit"
                                            sx={{
                                                ...inputStyles['& .MuiOutlinedInput-root'],
                                                '& .MuiSelect-icon': { color: colors.textMuted },
                                            }}
                                            MenuProps={{
                                                slotProps: {
                                                    paper: {
                                                        sx: {
                                                            bgcolor: colors.bgCardHover,
                                                            border: `1px solid rgba(255,255,255,0.08)`,
                                                            borderRadius: '10px',
                                                            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                                                            mt: 0.5,
                                                        }
                                                    }
                                                }
                                            }}
                                        >
                                            <MenuItem value="money" sx={{ fontSize: '13px', py: 1.25, borderRadius: '6px', mx: 0.5 }}>
                                                💵 Dinheiro
                                            </MenuItem>
                                            <MenuItem value="debit" sx={{ fontSize: '13px', py: 1.25, borderRadius: '6px', mx: 0.5 }}>
                                                💳 Débito
                                            </MenuItem>
                                            <MenuItem value="credit" sx={{ fontSize: '13px', py: 1.25, borderRadius: '6px', mx: 0.5 }}>
                                                💳 Cartão de Crédito
                                            </MenuItem>
                                            <MenuItem value="pix" sx={{ fontSize: '13px', py: 1.25, borderRadius: '6px', mx: 0.5 }}>
                                                📱 PIX
                                            </MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>

                                {/* Categoria */}
                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={labelStyles}>Categoria</Typography>
                                    <Controller
                                        name="category_id"
                                        control={control}
                                        render={({ field }) => {
                                            const selectedCategory = categories?.find((c) => c.id === field.value);
                                            const Icon = selectedCategory ? getCategoryIcon(selectedCategory.name) : Tag;

                                            return (
                                                <FormControl fullWidth>
                                                    <Select
                                                        value={field.value || ''}
                                                        onChange={(e) => field.onChange(e.target.value)}
                                                        displayEmpty
                                                        renderValue={() => (
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Icon size={18} color={selectedCategory?.color || colors.textMuted} />
                                                                <Typography sx={{ fontSize: '13px', color: selectedCategory ? colors.textPrimary : colors.textMuted }}>
                                                                    {selectedCategory?.name || 'Selecione'}
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                        sx={{
                                                            ...inputStyles['& .MuiOutlinedInput-root'],
                                                            '& .MuiSelect-icon': { color: colors.textMuted },
                                                        }}
                                                        MenuProps={{
                                                            slotProps: {
                                                                paper: {
                                                                    sx: {
                                                                        bgcolor: colors.bgCardHover,
                                                                        border: `1px solid rgba(255,255,255,0.08)`,
                                                                        borderRadius: '10px',
                                                                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                                                                        mt: 0.5,
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
                                                                    }
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        {filteredCategories.map((cat) => {
                                                            const CatIcon = getCategoryIcon(cat.name);
                                                            return (
                                                                <MenuItem
                                                                    key={cat.id}
                                                                    value={cat.id}
                                                                    sx={{
                                                                        fontSize: '13px',
                                                                        py: 1.25,
                                                                        borderRadius: '6px',
                                                                        mx: 0.5,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: 1.25,
                                                                    }}
                                                                >
                                                                    <CatIcon size={18} color={cat.color} />
                                                                    {cat.name}
                                                                </MenuItem>
                                                            );
                                                        })}
                                                    </Select>
                                                </FormControl>
                                            );
                                        }}
                                    />
                                </Box>
                            </Stack>

                            {/* ROW 3: Conta + Cartão + Data (3 columns) */}
                            <Box sx={{
                                display: 'grid',
                                gridTemplateColumns: isMobile ? '1fr' : (paymentMethod === 'credit' ? '1fr 1fr 1fr' : '1fr 1fr'),
                                gap: 1.5,
                            }}>
                                {/* Conta */}
                                <Box>
                                    <Typography sx={labelStyles}>Conta *</Typography>
                                    <FormControl fullWidth error={!!errors.account_id}>
                                        <Select
                                            {...register('account_id')}
                                            defaultValue={transaction?.account_id || ''}
                                            displayEmpty
                                            sx={{
                                                ...inputStyles['& .MuiOutlinedInput-root'],
                                                '& .MuiSelect-icon': { color: colors.textMuted },
                                            }}
                                            MenuProps={{
                                                slotProps: {
                                                    paper: {
                                                        sx: {
                                                            bgcolor: colors.bgCardHover,
                                                            border: `1px solid rgba(255,255,255,0.08)`,
                                                            borderRadius: '10px',
                                                            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                                                            mt: 0.5,
                                                        }
                                                    }
                                                }
                                            }}
                                        >
                                            <MenuItem value="" disabled sx={{ fontSize: '13px', color: colors.textMuted }}>
                                                Selecione...
                                            </MenuItem>
                                            {accounts?.map((acc) => (
                                                <MenuItem key={acc.id} value={acc.id} sx={{ fontSize: '13px', py: 1.25, borderRadius: '6px', mx: 0.5 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        {getAccountIcon(acc.type, acc.color)} {acc.name}
                                                    </Box>
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {errors.account_id && (
                                            <FormHelperText sx={{ color: colors.red, fontSize: '11px' }}>
                                                {errors.account_id.message}
                                            </FormHelperText>
                                        )}
                                    </FormControl>
                                </Box>

                                {/* Cartão (only if credit) */}
                                {paymentMethod === 'credit' && (
                                    <Box>
                                        <Typography sx={labelStyles}>Cartão *</Typography>
                                        <FormControl fullWidth error={!!errors.card_id}>
                                            <Select
                                                {...register('card_id')}
                                                defaultValue={transaction?.card_id || ''}
                                                displayEmpty
                                                disabled={!watch('account_id')}
                                                sx={{
                                                    ...inputStyles['& .MuiOutlinedInput-root'],
                                                    '& .MuiSelect-icon': { color: colors.textMuted },
                                                }}
                                                MenuProps={{
                                                    slotProps: {
                                                        paper: {
                                                            sx: {
                                                                bgcolor: colors.bgCardHover,
                                                                border: `1px solid rgba(255,255,255,0.08)`,
                                                                borderRadius: '10px',
                                                                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                                                                mt: 0.5,
                                                            }
                                                        }
                                                    }
                                                }}
                                            >
                                                <MenuItem value="" disabled sx={{ fontSize: '13px', color: colors.textMuted }}>
                                                    Selecione...
                                                </MenuItem>
                                                {cards?.map((card) => (
                                                    <MenuItem key={card.id} value={card.id} sx={{ fontSize: '13px', py: 1.25, borderRadius: '6px', mx: 0.5 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                            <CardIcon size={18} color={card.color} /> {card.name}
                                                        </Box>
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Box>
                                )}

                                {/* Data */}
                                <Box>
                                    <Typography sx={labelStyles}>Data *</Typography>
                                    <Controller
                                        name="payment_date"
                                        control={control}
                                        render={({ field }) => (
                                            <DatePicker
                                                value={field.value ? new Date(`${field.value}T00:00:00`) : null}
                                                onChange={(newValue) => {
                                                    if (!newValue || Number.isNaN(newValue.getTime())) {
                                                        field.onChange('');
                                                        return;
                                                    }
                                                    field.onChange(format(newValue, 'yyyy-MM-dd'));
                                                }}
                                                slotProps={{
                                                    textField: {
                                                        fullWidth: true,
                                                        sx: modernDateInputSx,
                                                    },
                                                    popper: {
                                                        sx: {
                                                            '& .MuiPaper-root': {
                                                                borderRadius: '14px',
                                                                border: `1px solid ${colors.border}`,
                                                                backgroundColor: colors.bgCard,
                                                            },
                                                            '& .MuiPickersLayout-actionBar': {
                                                                display: 'none',
                                                            },
                                                        },
                                                    },
                                                }}
                                            />
                                        )}
                                    />
                                </Box>
                            </Box>
                        </Box>
                    )}

                    {/* Transfer accounts */}
                    {transactionType === 'transfer' && (
                        <Box sx={{ mb: 2 }}>
                            <Typography sx={sectionLabel}>Transferência</Typography>
                            <Box sx={{
                                display: 'grid',
                                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
                                gap: 1.5,
                            }}>
                                <Box>
                                    <Typography sx={labelStyles}>Origem *</Typography>
                                    <FormControl fullWidth error={!!errors.account_id}>
                                        <Select
                                            {...register('account_id')}
                                            defaultValue={transaction?.account_id || ''}
                                            displayEmpty
                                            sx={{ ...inputStyles['& .MuiOutlinedInput-root'], '& .MuiSelect-icon': { color: colors.textMuted } }}
                                        >
                                            <MenuItem value="" disabled>Selecione...</MenuItem>
                                            {accounts?.map((acc) => (
                                                <MenuItem key={acc.id} value={acc.id} sx={{ fontSize: '13px' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        {getAccountIcon(acc.type, acc.color)} {acc.name}
                                                    </Box>
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                                <Box>
                                    <Typography sx={labelStyles}>Destino *</Typography>
                                    <FormControl fullWidth error={!!errors.to_account_id}>
                                        <Select
                                            {...register('to_account_id')}
                                            defaultValue={transaction?.to_account_id || ''}
                                            displayEmpty
                                            sx={{ ...inputStyles['& .MuiOutlinedInput-root'], '& .MuiSelect-icon': { color: colors.textMuted } }}
                                        >
                                            <MenuItem value="" disabled>Selecione...</MenuItem>
                                            {accounts?.map((acc) => (
                                                <MenuItem key={acc.id} value={acc.id} sx={{ fontSize: '13px' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        {getAccountIcon(acc.type, acc.color)} {acc.name}
                                                    </Box>
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                                <Box>
                                    <Typography sx={labelStyles}>Data *</Typography>
                                    <Controller
                                        name="payment_date"
                                        control={control}
                                        render={({ field }) => (
                                            <DatePicker
                                                value={field.value ? new Date(`${field.value}T00:00:00`) : null}
                                                onChange={(newValue) => {
                                                    if (!newValue || Number.isNaN(newValue.getTime())) {
                                                        field.onChange('');
                                                        return;
                                                    }
                                                    field.onChange(format(newValue, 'yyyy-MM-dd'));
                                                }}
                                                slotProps={{
                                                    textField: {
                                                        fullWidth: true,
                                                        sx: modernDateInputSx,
                                                    },
                                                    popper: {
                                                        sx: {
                                                            '& .MuiPaper-root': {
                                                                borderRadius: '14px',
                                                                border: `1px solid ${colors.border}`,
                                                                backgroundColor: colors.bgCard,
                                                            },
                                                            '& .MuiPickersLayout-actionBar': {
                                                                display: 'none',
                                                            },
                                                        },
                                                    },
                                                }}
                                            />
                                        )}
                                    />
                                </Box>
                            </Box>
                        </Box>
                    )}

                    {/* ROW 4: Toggles Recorrente + Parcelar */}
                    <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
                        <Box sx={{
                            flex: 1,
                            bgcolor: 'rgba(255,255,255,0.03)',
                            border: `1px solid ${isFixed ? colors.blue : 'rgba(255,255,255,0.06)'}`,
                            borderRadius: '10px',
                            p: 1.5,
                            transition: 'all 200ms ease',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                        }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <RefreshCw size={16} color={isFixed ? colors.blue : colors.textMuted} />
                                    <Typography sx={{ fontSize: '13px', fontWeight: 500, color: isFixed ? colors.textPrimary : colors.textSecondary }}>
                                        Recorrente
                                    </Typography>
                                </Stack>
                                <Switch
                                    {...register('is_fixed')}
                                    size="small"
                                    sx={{
                                        width: 40, height: 22, p: 0,
                                        '& .MuiSwitch-switchBase': {
                                            p: '3px',
                                            '&.Mui-checked': { transform: 'translateX(18px)', '& + .MuiSwitch-track': { bgcolor: colors.blue, opacity: 1 } },
                                        },
                                        '& .MuiSwitch-thumb': { width: 16, height: 16, bgcolor: '#fff' },
                                        '& .MuiSwitch-track': { borderRadius: 11, bgcolor: 'rgba(255,255,255,0.1)', opacity: 1 },
                                    }}
                                />
                            </Stack>
                        </Box>

                        <Box sx={{
                            flex: 1,
                            bgcolor: 'rgba(255,255,255,0.03)',
                            border: `1px solid ${isInstallment ? colors.purple : 'rgba(255,255,255,0.06)'}`,
                            borderRadius: '10px',
                            p: 1.5,
                            transition: 'all 200ms ease',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                        }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Layers size={16} color={isInstallment ? colors.purple : colors.textMuted} />
                                    <Typography sx={{ fontSize: '13px', fontWeight: 500, color: isInstallment ? colors.textPrimary : colors.textSecondary }}>
                                        Parcelar
                                    </Typography>
                                </Stack>
                                <Switch
                                    {...register('is_installment')}
                                    size="small"
                                    sx={{
                                        width: 40, height: 22, p: 0,
                                        '& .MuiSwitch-switchBase': {
                                            p: '3px',
                                            '&.Mui-checked': { transform: 'translateX(18px)', '& + .MuiSwitch-track': { bgcolor: colors.purple, opacity: 1 } },
                                        },
                                        '& .MuiSwitch-thumb': { width: 16, height: 16, bgcolor: '#fff' },
                                        '& .MuiSwitch-track': { borderRadius: 11, bgcolor: 'rgba(255,255,255,0.1)', opacity: 1 },
                                    }}
                                />
                            </Stack>
                        </Box>
                    </Stack>

                    {/* Conditional fields */}
                    <Collapse in={isFixed && !isInstallment && !transaction}>
                        <Box sx={{ mb: 2 }}>
                            <Typography sx={labelStyles}>Repetir por quantos meses?</Typography>
                            <TextField fullWidth size="small" type="number" placeholder="12" {...register('repeat_count')} sx={inputStyles} />
                        </Box>
                    </Collapse>

                    <Collapse in={isInstallment}>
                        <Stack spacing={2} sx={{ mb: 2 }}>
                            <Box>
                                <Typography sx={labelStyles}>Número de Parcelas</Typography>
                                <TextField fullWidth size="small" type="number" placeholder="12" {...register('total_installments')} sx={inputStyles} />
                                {amount > 0 && totalInstallments > 0 && (
                                    <Typography sx={{ fontSize: '12px', color: colors.accent, mt: 0.5 }}>
                                        {totalInstallments}x de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount / totalInstallments)}
                                    </Typography>
                                )}
                            </Box>
                            <InstallmentGrid show={showInstallmentGrid} setShow={setShowInstallmentGrid} fields={fields} register={register} />
                        </Stack>
                    </Collapse>

                    {/* Apply to group toggle */}
                    {transaction && (transaction.installment_group_id || transaction.recurring_group_id) && (
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                            <Typography sx={{ fontSize: '13px', color: colors.textSecondary }}>
                                Aplicar a todo o grupo
                            </Typography>
                            <Switch
                                checked={applyToGroup}
                                onChange={(e) => setApplyToGroup(e.target.checked)}
                                size="small"
                                sx={{
                                    width: 40, height: 22, p: 0,
                                    '& .MuiSwitch-switchBase': {
                                        p: '3px',
                                        '&.Mui-checked': { transform: 'translateX(18px)', '& + .MuiSwitch-track': { bgcolor: colors.accent, opacity: 1 } },
                                    },
                                    '& .MuiSwitch-thumb': { width: 16, height: 16, bgcolor: '#fff' },
                                    '& .MuiSwitch-track': { borderRadius: 11, bgcolor: 'rgba(255,255,255,0.1)', opacity: 1 },
                                }}
                            />
                        </Stack>
                    )}
                    </DialogContent>
                </LocalizationProvider>

                {/* Actions */}
                <DialogActions sx={{
                    px: 3, py: 2,
                    borderTop: '1px solid rgba(255,255,255,0.04)',
                    justifyContent: 'flex-end',
                    gap: 1.5,
                }}>
                    <Button
                        onClick={onClose}
                        sx={{
                            px: 3, py: 1.25, borderRadius: '10px',
                            fontSize: '14px', fontWeight: 500, color: colors.textSecondary,
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.04)', color: colors.textPrimary },
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        sx={{
                            px: 3, py: 1.25, borderRadius: '10px',
                            fontSize: '14px', fontWeight: 600,
                            bgcolor: colors.accent, color: colors.bgPrimary,
                            boxShadow: '0 2px 8px rgba(201, 168, 76, 0.25)',
                            transition: 'all 200ms ease',
                            '&:hover': { bgcolor: '#D4B85C', transform: 'translateY(-1px)', boxShadow: '0 4px 16px rgba(201, 168, 76, 0.3)' },
                            '&:active': { transform: 'translateY(0)' },
                            '&.Mui-disabled': { opacity: 0.5, bgcolor: colors.accent, color: colors.bgPrimary },
                        }}
                    >
                        {isSubmitting && <CircularProgress size={16} sx={{ mr: 1, color: colors.bgPrimary }} />}
                        {getSubmitLabel()}
                    </Button>
                </DialogActions>
            </form >
        </Dialog >
    );
}
