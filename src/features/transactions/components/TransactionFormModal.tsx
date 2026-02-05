import { useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Stack,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    FormControlLabel,
    Switch,
    Box,
    Collapse,
    FormHelperText
} from '@mui/material';
import { ChevronDown, ChevronUp, Wallet, Landmark, CreditCard as CardIcon } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useAccounts } from '../../accounts/hooks/useAccounts';
import { useCategories } from '../hooks/useCategories';
import { useCreditCards } from '../../cards/hooks/useCreditCards';
import { useCreateTransaction, useUpdateTransaction, useUpdateTransactionGroup } from '../hooks/useTransactions';
import { Transaction } from '../services/transactions.service';

const transactionSchema = z.object({
    description: z.string().min(3, 'Descrição deve ter pelo menos 3 caracteres'),
    amount: z.coerce.number().positive('Valor deve ser positivo'),
    type: z.enum(['income', 'expense', 'transfer']),
    payment_date: z.string(),
    account_id: z.string().optional(),
    to_account_id: z.string().optional(),
    card_id: z.string().optional(),
    category_id: z.string().optional().nullable(),
    is_fixed: z.boolean().default(false),
    repeat_count: z.coerce.number().min(1).max(60).optional(),
    is_paid: z.boolean().default(true),
    payment_method: z.string().optional(),
    notes: z.string().optional(),
    // Installment fields
    is_installment: z.boolean().default(false),
    total_installments: z.coerce.number().min(1, 'Mínimo 1').max(120, 'Máximo 120').optional(),
    installments: z.array(z.object({
        amount: z.coerce.number()
    })).optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface TransactionFormModalProps {
    open: boolean;
    onClose: () => void;
    transaction?: Transaction;
}

export function TransactionFormModal({ open, onClose, transaction }: TransactionFormModalProps) {
    const { data: accounts } = useAccounts();
    const { data: categories } = useCategories();
    const { data: cards } = useCreditCards();

    const [showInstallmentGrid, setShowInstallmentGrid] = useState(false);
    const [applyToGroup, setApplyToGroup] = useState(false);

    const createTransaction = useCreateTransaction();
    const updateTransaction = useUpdateTransaction();
    const updateTransactionGroup = useUpdateTransactionGroup();

    const {
        register,
        handleSubmit,
        control,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<TransactionFormValues>({
        resolver: zodResolver(transactionSchema) as any,
        defaultValues: {
            description: '',
            amount: 0,
            type: 'expense',
            payment_date: new Date().toISOString().split('T')[0],
            is_fixed: false,
            repeat_count: 1,
            is_paid: true,
            is_installment: false,
            total_installments: 1,
            account_id: '',
            category_id: '',
            installments: [],
        },
    });

    const { fields, replace } = useFieldArray({
        control,
        name: "installments"
    });

    const transactionType = watch('type');
    const paymentMethod = watch('payment_method');
    const isInstallment = watch('is_installment');
    const isFixed = watch('is_fixed');
    const totalInstallments = watch('total_installments') || 1;
    const baseAmount = watch('amount') || 0;
    const selectedAccountId = watch('account_id');

    // Filter cards based on selected account if payment method is credit
    const filteredCards = useMemo(() => {
        if (!cards) return [];
        if (paymentMethod === 'credit' && selectedAccountId) {
            return cards.filter(c => c.bank_account_id === selectedAccountId);
        }
        return cards;
    }, [cards, paymentMethod, selectedAccountId]);

    const getAccountIcon = (type: string, color: string) => {
        switch (type) {
            case 'checking': return <Landmark size={18} color={color} />;
            case 'savings': return <Wallet size={18} color={color} />;
            default: return <CardIcon size={18} color={color} />;
        }
    };

    // Sync installments when total installments or base amount changes
    useEffect(() => {
        if (isInstallment && totalInstallments > 0) {
            const installmentAmount = Number((baseAmount / totalInstallments).toFixed(2));
            const newInstallments = Array.from({ length: totalInstallments }, (_, i) => {
                // Adjust the last installment for rounding differences
                if (i === totalInstallments - 1) {
                    const sumOfOthers = installmentAmount * (totalInstallments - 1);
                    return { amount: Number((baseAmount - sumOfOthers).toFixed(2)) };
                }
                return { amount: installmentAmount };
            });
            replace(newInstallments);
        } else {
            replace([]);
        }
    }, [isInstallment, totalInstallments, baseAmount, replace]);

    useEffect(() => {
        if (open) {
            reset({
                description: transaction?.description || '',
                amount: transaction?.amount || 0,
                type: transaction?.type || 'expense',
                payment_date: transaction?.payment_date || new Date().toISOString().split('T')[0],
                is_fixed: transaction?.is_fixed || false,
                repeat_count: 1,
                is_paid: transaction?.is_paid ?? true,
                is_installment: !!transaction?.installment_group_id,
                total_installments: transaction?.total_installments || 1,
                account_id: transaction?.account_id || '',
                to_account_id: transaction?.to_account_id || '',
                card_id: transaction?.card_id || '',
                category_id: transaction?.category_id || '',
                payment_method: transaction?.payment_method || (transaction?.card_id ? 'credit' : 'debit'),
                notes: transaction?.notes || '',
                installments: [],
            });
            setShowInstallmentGrid(false);
        } else {
            setApplyToGroup(false);
        }
    }, [transaction, open, reset]);

    const onSubmit = async (values: TransactionFormValues) => {
        try {
            const payload: any = { ...values };

            if (values.type !== 'transfer') {
                delete payload.to_account_id;
            }

            // In credit mode, we keep both account_id and card_id
            if (values.payment_method !== 'credit') {
                delete payload.card_id;
            }

            if (!values.is_installment) {
                delete payload.total_installments;
                delete payload.installments;
                payload.installment_group_id = null;
            } else if (!transaction) {
                // Flatten installments for the service (only for new creations)
                payload.installment_amounts = values.installments?.map(i => i.amount);
                delete payload.installments;
            }

            if (!values.is_fixed) {
                payload.recurring_group_id = null;
            }

            // Final safety cleanup: convert empty strings to null for UUID fields
            ['category_id', 'account_id', 'card_id', 'to_account_id'].forEach(key => {
                if (payload[key] === '') payload[key] = null;
            });

            if (transaction) {
                // When updating, we don't want to trigger new recurring/installment logic
                delete payload.repeat_count;
                delete payload.is_installment;
                delete payload.installment_amounts;
                delete payload.installments;

                const groupId = transaction.installment_group_id || transaction.recurring_group_id;
                const groupType = transaction.installment_group_id ? 'installment' : 'recurring';

                if (applyToGroup && groupId) {
                    await updateTransactionGroup.mutateAsync({
                        groupId,
                        type: groupType,
                        updates: payload
                    });
                } else {
                    await updateTransaction.mutateAsync({ id: transaction.id, updates: payload });
                }
            } else {
                await createTransaction.mutateAsync(payload);
            }

            onClose();
        } catch (error) {
            console.error('Error saving transaction:', error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ fontWeight: 700 }}>
                {transaction ? 'Editar Transação' : 'Nova Transação'}
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <Controller
                            name="type"
                            control={control}
                            render={({ field }) => (
                                <ToggleButtonGroup
                                    {...field}
                                    exclusive
                                    onChange={(_, value) => {
                                        if (value) {
                                            field.onChange(value);
                                            setValue('category_id', '');
                                        }
                                    }}
                                    fullWidth
                                    sx={{ mb: 1 }}
                                >
                                    <ToggleButton value="expense" sx={{ color: 'error.main', '&.Mui-selected': { bgcolor: 'rgba(211, 47, 47, 0.1)', color: 'error.main' } }}>
                                        Despesa
                                    </ToggleButton>
                                    <ToggleButton value="income" sx={{ color: 'success.main', '&.Mui-selected': { bgcolor: 'rgba(46, 125, 50, 0.1)', color: 'success.main' } }}>
                                        Receita
                                    </ToggleButton>
                                    <ToggleButton value="transfer" sx={{ color: 'primary.main', '&.Mui-selected': { bgcolor: 'rgba(212, 175, 55, 0.1)', color: 'primary.main' } }}>
                                        Transf.
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            )}
                        />

                        <TextField
                            fullWidth
                            label="Valor Total"
                            type="number"
                            {...register('amount')}
                            error={!!errors.amount}
                            helperText={errors.amount?.message}
                            inputProps={{ step: '0.01' }}
                            InputProps={{
                                startAdornment: <Typography variant="body2" sx={{ mr: 1, color: 'text.secondary' }}>R$</Typography>,
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Descrição"
                            {...register('description')}
                            error={!!errors.description}
                            helperText={errors.description?.message}
                            placeholder="Ex: Aluguel, Supermercado..."
                        />

                        {transaction && (transaction.installment_group_id || transaction.recurring_group_id) && (
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={applyToGroup}
                                        onChange={(e) => setApplyToGroup(e.target.checked)}
                                        size="small"
                                    />
                                }
                                label={
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        Aplicar alteração a todo o grupo ({transaction.installment_group_id ? 'parcelas' : 'recorrência'})
                                    </Typography>
                                }
                                sx={{ mt: -1 }}
                            />
                        )}

                        {transactionType !== 'transfer' && (
                            <FormControl fullWidth>
                                <InputLabel>Forma de Pagamento</InputLabel>
                                <Select
                                    label="Forma de Pagamento"
                                    {...register('payment_method')}
                                    defaultValue="debit"
                                >
                                    <MenuItem value="money">💵 Dinheiro</MenuItem>
                                    <MenuItem value="debit">💳 Débito</MenuItem>
                                    <MenuItem value="credit">💳 Cartão de Crédito</MenuItem>
                                    <MenuItem value="pix">📱 PIX</MenuItem>
                                </Select>
                            </FormControl>
                        )}

                        <FormControl fullWidth error={!!errors.account_id}>
                            <InputLabel>{transactionType === 'transfer' ? 'Origem' : 'Conta'}</InputLabel>
                            <Select
                                label={transactionType === 'transfer' ? 'Origem' : 'Conta'}
                                {...register('account_id')}
                                defaultValue={transaction?.account_id || ''}
                                renderValue={(selected) => {
                                    const acc = accounts?.find(a => a.id === selected);
                                    if (!acc) return selected;
                                    return (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {getAccountIcon(acc.type, acc.color)}
                                            {acc.name}
                                        </Box>
                                    );
                                }}
                            >
                                {accounts?.map((acc) => (
                                    <MenuItem key={acc.id} value={acc.id}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, w: '100%' }}>
                                            <Box sx={{
                                                display: 'flex',
                                                p: 0.5,
                                                bgcolor: `${acc.color}1A`,
                                                borderRadius: 1
                                            }}>
                                                {getAccountIcon(acc.type, acc.color)}
                                            </Box>
                                            {acc.name}
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.account_id && <FormHelperText>{errors.account_id.message}</FormHelperText>}
                        </FormControl>

                        {transactionType !== 'transfer' && paymentMethod === 'credit' && (
                            <FormControl fullWidth error={!!errors.card_id}>
                                <InputLabel>Cartão de Crédito</InputLabel>
                                <Select
                                    label="Cartão de Crédito"
                                    {...register('card_id')}
                                    defaultValue={transaction?.card_id || ''}
                                    disabled={!selectedAccountId}
                                    renderValue={(selected) => {
                                        const card = cards?.find(c => c.id === selected);
                                        if (!card) return selected;
                                        return (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <CardIcon size={18} color={card.color} />
                                                {card.name}
                                            </Box>
                                        );
                                    }}
                                >
                                    {filteredCards?.map((card) => (
                                        <MenuItem key={card.id} value={card.id}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, w: '100%' }}>
                                                <Box sx={{
                                                    display: 'flex',
                                                    p: 0.5,
                                                    bgcolor: `${card.color}1A`,
                                                    borderRadius: 1
                                                }}>
                                                    <CardIcon size={18} color={card.color} />
                                                </Box>
                                                {card.name}
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                                {!selectedAccountId && <FormHelperText>Selecione a conta primeiro</FormHelperText>}
                                {errors.card_id && <FormHelperText>{errors.card_id.message}</FormHelperText>}
                            </FormControl>
                        )}

                        {transactionType === 'transfer' && (
                            <FormControl fullWidth error={!!errors.to_account_id}>
                                <InputLabel>Destino</InputLabel>
                                <Select
                                    label="Destino"
                                    {...register('to_account_id')}
                                    defaultValue={transaction?.to_account_id || ''}
                                    renderValue={(selected) => {
                                        const acc = accounts?.find(a => a.id === selected);
                                        if (!acc) return selected;
                                        return (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {getAccountIcon(acc.type, acc.color)}
                                                {acc.name}
                                            </Box>
                                        );
                                    }}
                                >
                                    {accounts?.map((acc) => (
                                        <MenuItem key={acc.id} value={acc.id}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, w: '100%' }}>
                                                <Box sx={{
                                                    display: 'flex',
                                                    p: 0.5,
                                                    bgcolor: `${acc.color}1A`,
                                                    borderRadius: 1
                                                }}>
                                                    {getAccountIcon(acc.type, acc.color)}
                                                </Box>
                                                {acc.name}
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.to_account_id && <FormHelperText>{errors.to_account_id.message}</FormHelperText>}
                            </FormControl>
                        )}

                        {transactionType !== 'transfer' && (
                            <FormControl fullWidth>
                                <InputLabel>Categoria</InputLabel>
                                <Select
                                    label="Categoria"
                                    {...register('category_id')}
                                    defaultValue={transaction?.category_id || ''}
                                    renderValue={(selected) => {
                                        const cat = categories?.find(c => c.id === selected);
                                        if (!cat) return selected;
                                        return (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: cat.color }} />
                                                {cat.name}
                                            </Box>
                                        );
                                    }}
                                >
                                    <MenuItem value="">Sem Categoria</MenuItem>
                                    {categories?.filter(c => c.type === transactionType).map((cat) => (
                                        <MenuItem key={cat.id} value={cat.id}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: cat.color }} />
                                                {cat.name}
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        <TextField
                            fullWidth
                            label="Data"
                            type="date"
                            {...register('payment_date')}
                            InputLabelProps={{ shrink: true }}
                        />

                        <Box sx={{ bgcolor: 'rgba(255,255,255,0.02)', p: 2, borderRadius: 1, border: '1px solid rgba(255,255,255,0.05)' }}>
                            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: (isInstallment || isFixed) ? 2 : 0 }}>
                                <Controller
                                    name="is_fixed"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControlLabel
                                            control={<Switch {...field} checked={field.value} size="small" />}
                                            label={<Typography variant="body2">Recorrente</Typography>}
                                            sx={{ flex: 1 }}
                                        />
                                    )}
                                />
                                <Controller
                                    name="is_installment"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControlLabel
                                            control={<Switch {...field} checked={field.value} size="small" />}
                                            label={<Typography variant="body2">Parcelar</Typography>}
                                            sx={{ flex: 1 }}
                                        />
                                    )}
                                />
                            </Stack>

                            {isFixed && !isInstallment && !transaction && (
                                <Box sx={{ mt: 2 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Repetir por N meses"
                                        type="number"
                                        {...register('repeat_count')}
                                        error={!!errors.repeat_count}
                                        helperText={errors.repeat_count?.message}
                                        inputProps={{ min: 1, max: 60 }}
                                    />
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                        Cria várias cópias futuras desta transação.
                                    </Typography>
                                </Box>
                            )}

                            {isInstallment && (
                                <Stack spacing={2}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Número de Parcelas"
                                        type="number"
                                        {...register('total_installments')}
                                        error={!!errors.total_installments}
                                        helperText={errors.total_installments?.message}
                                        inputProps={{ min: 1, max: 120 }}
                                    />

                                    <Box>
                                        <Button
                                            size="small"
                                            variant="text"
                                            endIcon={showInstallmentGrid ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                            onClick={() => setShowInstallmentGrid(!showInstallmentGrid)}
                                        >
                                            Ajustar valores das parcelas
                                        </Button>

                                        <Collapse in={showInstallmentGrid}>
                                            <Box sx={{
                                                mt: 2,
                                                maxHeight: 200,
                                                overflowY: 'auto',
                                                pr: 1,
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(2, 1fr)',
                                                gap: 1
                                            }}>
                                                {fields.map((field, index) => (
                                                    <TextField
                                                        key={field.id}
                                                        fullWidth
                                                        size="small"
                                                        label={`Parcela ${index + 1}`}
                                                        type="number"
                                                        {...register(`installments.${index}.amount` as const)}
                                                        inputProps={{ step: '0.01' }}
                                                        InputProps={{
                                                            startAdornment: <Typography variant="caption" sx={{ mr: 0.5 }}>R$</Typography>
                                                        }}
                                                    />
                                                ))}
                                            </Box>
                                        </Collapse>
                                    </Box>
                                </Stack>
                            )}
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={onClose} color="inherit">Cancelar</Button>
                    <Button
                        variant="contained"
                        type="submit"
                        disabled={isSubmitting || createTransaction.isPending || updateTransaction.isPending}
                    >
                        {isSubmitting || createTransaction.isPending || updateTransaction.isPending ? 'Salvando...' : transaction ? 'Salvar Alterações' : 'Criar Transação'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
