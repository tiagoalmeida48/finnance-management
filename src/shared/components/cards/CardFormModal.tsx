import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, Stack,
    Box, InputAdornment, Chip
} from '@mui/material';
import { useCreateCreditCard, useUpdateCreditCard } from '../../hooks/useCreditCards';
import { useAccounts } from '../../hooks/useAccounts';
import { CreditCard } from '../../interfaces/credit-card.interface';
import { colors } from '@/shared/theme';
import { CardLinkedAccountSelect } from './cardFormFields';
import { inputStyles, labelStyles } from './cardFormStyles';

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

const OPEN_CYCLE_END = '9999-12-31';

const formatCycleDateLabel = (value?: string) => {
    if (!value) return '-';
    const parsed = new Date(`${value}T12:00:00`);
    if (Number.isNaN(parsed.getTime())) return '-';
    return parsed.toLocaleDateString('pt-BR');
};

interface CardFormModalProps {
    open: boolean;
    onClose: () => void;
    card?: CreditCard;
}

export function CardFormModal({ open, onClose, card }: CardFormModalProps) {
    const createCard = useCreateCreditCard();
    const updateCard = useUpdateCreditCard();
    const { data: accounts } = useAccounts();

    const { register, handleSubmit, reset, control, setValue, formState: { errors } } = useForm<CardFormValues>({
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

    const currentColor = useWatch({
        control,
        name: 'color',
        defaultValue: '#C9A84C',
    });
    const creditLimit = useWatch({
        control,
        name: 'credit_limit',
        defaultValue: 0,
    });
    const selectedAccountId = useWatch({
        control,
        name: 'bank_account_id',
        defaultValue: '',
    });

    const currentCycle = card?.current_statement_cycle ?? null;
    const activeClosingDay = currentCycle?.closing_day ?? card?.closing_day;
    const activeDueDay = currentCycle?.due_day ?? card?.due_day;
    const cyclePeriodLabel = currentCycle
        ? `${formatCycleDateLabel(currentCycle.date_start)} ${
            currentCycle.date_end === OPEN_CYCLE_END
                ? 'em diante'
                : `ate ${formatCycleDateLabel(currentCycle.date_end)}`
        }`
        : null;

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
        }
    }, [card, open, reset]);

    const handleMoneyInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const digits = e.target.value.replace(/\D/g, '');
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
                const updates = {
                    name: values.name,
                    bank_account_id: values.bank_account_id,
                    credit_limit: values.credit_limit,
                    color: values.color,
                    notes: values.notes,
                };
                await updateCard.mutateAsync({ id: card.id, updates });
            } else {
                await createCard.mutateAsync({
                    ...values,
                    is_active: true,
                });
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
                                <CardLinkedAccountSelect
                                    accounts={accounts}
                                    value={selectedAccountId}
                                    onChange={(value) => setValue('bank_account_id', value, { shouldDirty: true, shouldValidate: true })}
                                    errorMessage={errors.bank_account_id?.message}
                                />
                            </Box>
                        </Stack>

                        {/* Row 2: Limite de Crédito - formatação monetária RTL */}
                        <Box>
                            <Typography sx={labelStyles}>Limite de Crédito</Typography>
                            <TextField
                                fullWidth
                                placeholder="0,00"
                                value={formatDisplayValue(String(Math.round(Number(creditLimit || 0) * 100)))}
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

                        {!card ? (
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
                        ) : (
                            <Box sx={{
                                p: 1.5,
                                borderRadius: '10px',
                                border: `1px solid ${colors.border}`,
                                bgcolor: 'rgba(201, 168, 76, 0.08)',
                            }}>
                                <Typography sx={{ fontSize: '12px', color: colors.textSecondary, mb: 1 }}>
                                    Vigencia atual do ciclo da fatura
                                </Typography>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
                                    <Chip
                                        size="small"
                                        label={`Fechamento: dia ${activeClosingDay ?? '-'}`}
                                        sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: colors.textPrimary }}
                                    />
                                    <Chip
                                        size="small"
                                        label={`Vencimento: dia ${activeDueDay ?? '-'}`}
                                        sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: colors.textPrimary }}
                                    />
                                </Stack>
                                <Typography sx={{ fontSize: '11px', color: colors.textMuted }}>
                                    {cyclePeriodLabel ? `Periodo: ${cyclePeriodLabel}` : 'Periodo: sem vigencia carregada'}
                                </Typography>
                                <Typography sx={{ fontSize: '11px', color: colors.textMuted, mt: 0.75 }}>
                                    Para alterar dias de fechamento e vencimento, use o historico de ciclo no detalhe do cartao.
                                </Typography>
                            </Box>
                        )}

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
