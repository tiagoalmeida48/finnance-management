import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, Stack,
    MenuItem, FormControl, Select, FormHelperText, Box, InputAdornment
} from '@mui/material';
import { Landmark, Wallet, CreditCard as CardIcon, Briefcase, PiggyBank } from 'lucide-react';
import { useCreateCreditCard, useUpdateCreditCard } from '../../hooks/useCreditCards';
import { useAccounts } from '../../hooks/useAccounts';
import { CreditCard } from '../../interfaces/credit-card.interface';
import { colors } from '@/shared/theme';

const cardSchema = z.object({
    name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    bank_account_id: z.string().min(1, 'Selecione uma conta vinculada'),
    credit_limit: z.number().min(0, 'Limite deve ser positivo'),
    closing_day: z.number().min(1).max(31),
    due_day: z.number().min(1).max(31),
    color: z.string().min(1, 'Cor é obrigatória'),
    notes: z.string().optional(),
});

type CardFormValues = z.infer<typeof cardSchema>;

interface CardFormModalProps {
    open: boolean;
    onClose: () => void;
    card?: CreditCard;
}

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

const labelStyles = {
    fontSize: '11px',
    fontFamily: '"DM Sans"',
    fontWeight: 500,
    color: colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
    mb: 0.75,
};

const getAccountIcon = (type: string, iconColor: string) => {
    switch (type) {
        case 'checking': return <Landmark size={16} color={iconColor} />;
        case 'savings': return <PiggyBank size={16} color={iconColor} />;
        case 'investment': return <Briefcase size={16} color={iconColor} />;
        case 'wallet': return <Wallet size={16} color={iconColor} />;
        default: return <CardIcon size={16} color={iconColor} />;
    }
};

export function CardFormModal({ open, onClose, card }: CardFormModalProps) {
    const createCard = useCreateCreditCard();
    const updateCard = useUpdateCreditCard();
    const { data: accounts } = useAccounts();
    const [rawValue, setRawValue] = useState('0');

    const { register, handleSubmit, reset, control, watch, setValue, formState: { errors } } = useForm<CardFormValues>({
        resolver: zodResolver(cardSchema),
        defaultValues: {
            name: '',
            bank_account_id: '',
            credit_limit: 0,
            closing_day: 1,
            due_day: 10,
            color: '#C9A84C',
            notes: '',
        }
    });

    const currentColor = watch('color');

    useEffect(() => {
        if (open) {
            const cardColor = card?.color || '#C9A84C';
            const limitValue = Number(card?.credit_limit) || 0;
            reset({
                name: card?.name || '',
                bank_account_id: card?.bank_account_id || '',
                credit_limit: limitValue,
                closing_day: card?.closing_day || 1,
                due_day: card?.due_day || 10,
                color: cardColor,
                notes: card?.notes || '',
            });
            setRawValue(String(Math.round(limitValue * 100)));
        }
    }, [card, open, reset]);

    const handleMoneyInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const digits = e.target.value.replace(/\D/g, '');
        setRawValue(digits || '0');
        const numericValue = parseInt(digits || '0', 10) / 100;
        setValue('credit_limit', numericValue);
    };

    const formatDisplayValue = (raw: string) => {
        const numericValue = parseInt(raw || '0', 10) / 100;
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(numericValue);
    };

    const onSubmit = async (values: CardFormValues) => {
        try {
            if (card) {
                await updateCard.mutateAsync({ id: card.id, updates: values });
            } else {
                await createCard.mutateAsync(values as any);
            }
            onClose();
        } catch (error) {
            console.error('Error saving credit card:', error);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: {
                    bgcolor: colors.bgCard,
                    borderRadius: '20px',
                    border: `1px solid ${colors.border}`,
                    maxWidth: 540,
                }
            }}
        >
            <DialogTitle sx={{ fontWeight: 700, fontSize: '20px', color: colors.textPrimary, fontFamily: 'Plus Jakarta Sans', pb: 1 }}>
                {card ? 'Editar Cartão' : 'Novo Cartão'}
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent sx={{ pt: 2, pb: 3 }}>
                    <Stack spacing={2.5}>
                        {/* Row 1: Nome + Conta */}
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <Box sx={{ flex: 1 }}>
                                <Typography sx={labelStyles}>Nome do Cartão</Typography>
                                <TextField
                                    fullWidth
                                    placeholder="Ex: Nubank, Inter, C6..."
                                    {...register('name')}
                                    error={!!errors.name}
                                    helperText={errors.name?.message}
                                    sx={inputStyles}
                                />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography sx={labelStyles}>Conta Vinculada</Typography>
                                <FormControl fullWidth error={!!errors.bank_account_id}>
                                    <Controller
                                        name="bank_account_id"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                displayEmpty
                                                sx={{
                                                    ...inputStyles['& .MuiOutlinedInput-root'],
                                                    '& .MuiSelect-icon': { color: colors.textMuted }
                                                }}
                                                renderValue={(selected) => {
                                                    if (!selected) {
                                                        return <Typography sx={{ color: colors.textMuted }}>Selecione...</Typography>;
                                                    }
                                                    const acc = accounts?.find(a => a.id === selected);
                                                    if (!acc) return selected;
                                                    return (
                                                        <Stack direction="row" spacing={1} alignItems="center">
                                                            {getAccountIcon(acc.type, acc.color || colors.textMuted)}
                                                            <Typography sx={{ color: colors.textPrimary }}>{acc.name}</Typography>
                                                        </Stack>
                                                    );
                                                }}
                                            >
                                                <MenuItem value="" disabled>
                                                    <Typography sx={{ color: colors.textMuted }}>Selecione...</Typography>
                                                </MenuItem>
                                                {accounts?.map((acc) => (
                                                    <MenuItem key={acc.id} value={acc.id}>
                                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                                            {getAccountIcon(acc.type, acc.color || colors.textMuted)}
                                                            <Typography>{acc.name}</Typography>
                                                        </Stack>
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        )}
                                    />
                                    {errors.bank_account_id && <FormHelperText>{errors.bank_account_id.message}</FormHelperText>}
                                </FormControl>
                            </Box>
                        </Stack>

                        {/* Row 2: Limite de Crédito - formatação monetária RTL */}
                        <Box>
                            <Typography sx={labelStyles}>Limite de Crédito</Typography>
                            <TextField
                                fullWidth
                                placeholder="0,00"
                                value={formatDisplayValue(rawValue)}
                                onChange={handleMoneyInput}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start" sx={{ color: colors.textMuted }}>R$</InputAdornment>,
                                }}
                                sx={{
                                    ...inputStyles,
                                    '& input': { textAlign: 'right' },
                                }}
                            />
                        </Box>

                        {/* Row 3: Dia Fechamento + Dia Vencimento */}
                        <Stack direction="row" spacing={2}>
                            <Box sx={{ flex: 1 }}>
                                <Typography sx={labelStyles}>Dia Fechamento</Typography>
                                <TextField
                                    fullWidth
                                    type="number"
                                    {...register('closing_day', { valueAsNumber: true })}
                                    inputProps={{ min: 1, max: 31 }}
                                    sx={inputStyles}
                                />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography sx={labelStyles}>Dia Vencimento</Typography>
                                <TextField
                                    fullWidth
                                    type="number"
                                    {...register('due_day', { valueAsNumber: true })}
                                    inputProps={{ min: 1, max: 31 }}
                                    sx={inputStyles}
                                />
                            </Box>
                        </Stack>

                        {/* Row 4: Notas */}
                        <Box>
                            <Typography sx={labelStyles}>Notas</Typography>
                            <TextField
                                fullWidth
                                multiline
                                rows={2}
                                placeholder="Observações opcionais..."
                                {...register('notes')}
                                sx={{
                                    ...inputStyles,
                                    '& .MuiOutlinedInput-root': {
                                        ...inputStyles['& .MuiOutlinedInput-root'],
                                        height: 'auto',
                                    }
                                }}
                            />
                        </Box>

                        {/* Row 5: Color Picker Only */}
                        <Box>
                            <Typography sx={labelStyles}>Cor do Cartão</Typography>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                bgcolor: 'rgba(255,255,255,0.03)',
                                borderRadius: '10px',
                                border: '1px solid rgba(255,255,255,0.06)',
                                px: 2,
                                py: 1,
                            }}>
                                <Box sx={{
                                    width: 32, height: 32, borderRadius: '6px',
                                    overflow: 'hidden', position: 'relative',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    bgcolor: currentColor,
                                }}>
                                    <input
                                        type="color"
                                        value={currentColor}
                                        onChange={(e) => setValue('color', e.target.value)}
                                        style={{
                                            position: 'absolute',
                                            width: '150%',
                                            height: '150%',
                                            cursor: 'pointer',
                                            border: 'none',
                                            background: 'none',
                                            padding: 0,
                                            top: '-25%',
                                            left: '-25%',
                                            opacity: 0,
                                        }}
                                    />
                                </Box>
                                <Typography sx={{ fontSize: '13px', color: colors.textSecondary }}>
                                    Clique para escolher uma cor
                                </Typography>
                            </Box>
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0, gap: 1 }}>
                    <Button
                        onClick={onClose}
                        sx={{
                            color: colors.textSecondary,
                            fontWeight: 600,
                            textTransform: 'none',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={createCard.isPending || updateCard.isPending}
                        sx={{
                            bgcolor: colors.accent,
                            color: '#0A0A0F',
                            fontWeight: 600,
                            textTransform: 'none',
                            borderRadius: '10px',
                            px: 3,
                            '&:hover': { bgcolor: '#D4B85C' },
                            '&:disabled': { opacity: 0.6 },
                        }}
                    >
                        Salvar
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
