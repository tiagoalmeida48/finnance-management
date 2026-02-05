import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, MenuItem,
    FormControl, InputLabel, Select, ToggleButton, ToggleButtonGroup, Typography,
    FormControlLabel, Switch, Box, FormHelperText
} from '@mui/material';
import { Landmark, Wallet, CreditCard as CardIcon } from 'lucide-react';
import { Controller, useFieldArray } from 'react-hook-form';
import { useTransactionFormLogic } from '../../hooks/useTransactionFormLogic';
import { InstallmentGrid } from './TransactionForm/InstallmentGrid';
import { Transaction } from '../../interfaces/transaction.interface';

interface TransactionFormModalProps {
    open: boolean;
    onClose: () => void;
    transaction?: Transaction;
}

export function TransactionFormModal({ open, onClose, transaction }: TransactionFormModalProps) {
    const {
        form, accounts, categories, cards,
        showInstallmentGrid, setShowInstallmentGrid,
        applyToGroup, setApplyToGroup,
        transactionType, paymentMethod, isInstallment, isFixed,
        onSubmit
    } = useTransactionFormLogic(open, onClose, transaction);

    const { register, control, watch, formState: { errors, isSubmitting } } = form;
    const { fields } = useFieldArray({ control, name: "installments" });

    const getAccountIcon = (type: string, color: string) => {
        switch (type) {
            case 'checking': return <Landmark size={18} color={color} />;
            case 'savings': return <Wallet size={18} color={color} />;
            default: return <CardIcon size={18} color={color} />;
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ fontWeight: 700 }}>
                {transaction ? 'Editar Transação' : 'Nova Transação'}
            </DialogTitle>
            <form onSubmit={onSubmit}>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <Controller
                            name="type"
                            control={control}
                            render={({ field }) => (
                                <ToggleButtonGroup
                                    {...field}
                                    exclusive
                                    onChange={(_, value) => value && field.onChange(value)}
                                    fullWidth
                                    sx={{ mb: 1 }}
                                >
                                    <ToggleButton value="expense" sx={{ color: 'error.main' }}>Despesa</ToggleButton>
                                    <ToggleButton value="income" sx={{ color: 'success.main' }}>Receita</ToggleButton>
                                    <ToggleButton value="transfer" sx={{ color: 'primary.main' }}>Transf.</ToggleButton>
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
                            InputProps={{ startAdornment: <Typography variant="body2" sx={{ mr: 1, color: 'text.secondary' }}>R$</Typography> }}
                        />

                        <TextField
                            fullWidth
                            label="Descrição"
                            {...register('description')}
                            error={!!errors.description}
                            helperText={errors.description?.message}
                        />

                        {transaction && (transaction.installment_group_id || transaction.recurring_group_id) && (
                            <FormControlLabel
                                control={<Switch checked={applyToGroup} onChange={(e) => setApplyToGroup(e.target.checked)} size="small" />}
                                label={<Typography variant="body2" sx={{ fontWeight: 500 }}>Aplicar a todo o grupo</Typography>}
                                sx={{ mt: -1 }}
                            />
                        )}

                        {transactionType !== 'transfer' && (
                            <FormControl fullWidth>
                                <InputLabel>Forma de Pagamento</InputLabel>
                                <Select label="Forma de Pagamento" {...register('payment_method')} defaultValue="debit">
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
                            >
                                {accounts?.map((acc) => (
                                    <MenuItem key={acc.id} value={acc.id}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            {getAccountIcon(acc.type, acc.color)} {acc.name}
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.account_id && <FormHelperText>{errors.account_id.message}</FormHelperText>}
                        </FormControl>

                        {transactionType !== 'transfer' && paymentMethod === 'credit' && (
                            <FormControl fullWidth error={!!errors.card_id}>
                                <InputLabel>Cartão de Crédito</InputLabel>
                                <Select label="Cartão de Crédito" {...register('card_id')} defaultValue={transaction?.card_id || ''} disabled={!watch('account_id')}>
                                    {cards?.map((card) => (
                                        <MenuItem key={card.id} value={card.id}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <CardIcon size={18} color={card.color} /> {card.name}
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {transactionType === 'transfer' && (
                            <FormControl fullWidth error={!!errors.to_account_id}>
                                <InputLabel>Destino</InputLabel>
                                <Select label="Destino" {...register('to_account_id')} defaultValue={transaction?.to_account_id || ''}>
                                    {accounts?.map((acc) => (
                                        <MenuItem key={acc.id} value={acc.id}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                {getAccountIcon(acc.type, acc.color)} {acc.name}
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {transactionType !== 'transfer' && (
                            <FormControl fullWidth>
                                <InputLabel>Categoria</InputLabel>
                                <Select label="Categoria" {...register('category_id')} defaultValue={transaction?.category_id || ''}>
                                    <MenuItem value="">Sem Categoria</MenuItem>
                                    {categories?.filter((c: any) => c.type === transactionType).map((cat: any) => (
                                        <MenuItem key={cat.id} value={cat.id}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: cat.color }} /> {cat.name}
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        <TextField fullWidth label="Data" type="date" {...register('payment_date')} InputLabelProps={{ shrink: true }} />

                        <Box sx={{ bgcolor: 'rgba(255,255,255,0.02)', p: 2, borderRadius: 1, border: '1px solid rgba(255,255,255,0.05)' }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <FormControlLabel control={<Switch {...register('is_fixed')} size="small" />} label={<Typography variant="body2">Recorrente</Typography>} />
                                <FormControlLabel control={<Switch {...register('is_installment')} size="small" />} label={<Typography variant="body2">Parcelar</Typography>} />
                            </Stack>

                            {isFixed && !isInstallment && !transaction && (
                                <Box sx={{ mt: 2 }}>
                                    <TextField fullWidth size="small" label="Meses" type="number" {...register('repeat_count')} />
                                </Box>
                            )}

                            {isInstallment && (
                                <Stack spacing={2} sx={{ mt: 2 }}>
                                    <TextField fullWidth size="small" label="Parcelas" type="number" {...register('total_installments')} />
                                    <InstallmentGrid show={showInstallmentGrid} setShow={setShowInstallmentGrid} fields={fields} register={register} />
                                </Stack>
                            )}
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={onClose} color="inherit">Cancelar</Button>
                    <Button variant="contained" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Salvando...' : transaction ? 'Salvar' : 'Criar'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
