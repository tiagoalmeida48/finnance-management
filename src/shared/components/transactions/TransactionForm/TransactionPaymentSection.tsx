import {
    Box,
    FormControl,
    FormHelperText,
    MenuItem,
    Select,
    Typography,
} from '@mui/material';
import { CreditCard as CardIcon } from 'lucide-react';
import { Controller, type Control, type FieldErrors, type UseFormRegister, type UseFormWatch } from 'react-hook-form';
import type { Account, Category, CreditCard, Transaction } from '@/shared/interfaces';
import type { TransactionFormValues } from '@/shared/hooks/useTransactionFormLogic';
import { colors } from '@/shared/theme';
import {
    getAccountIcon,
    getCategoryIcon,
    inputStyles,
    labelStyles,
    scrollableSelectMenuPaperSx,
    sectionLabel,
    selectMenuPaperSx,
} from './transactionFormStyles';
import { TransactionDateField } from './TransactionDateField';

interface TransactionPaymentSectionProps {
    isMobile: boolean;
    transaction?: Transaction;
    paymentMethod?: string;
    register: UseFormRegister<TransactionFormValues>;
    control: Control<TransactionFormValues>;
    watch: UseFormWatch<TransactionFormValues>;
    errors: FieldErrors<TransactionFormValues>;
    categories: Category[];
    filteredCategories: Category[];
    accounts: Account[];
    cards: CreditCard[];
}

export function TransactionPaymentSection({
    isMobile,
    transaction,
    paymentMethod,
    register,
    control,
    watch,
    errors,
    categories,
    filteredCategories,
    accounts,
    cards,
}: TransactionPaymentSectionProps) {
    return (
        <Box sx={{ mb: 2 }}>
            <Typography sx={sectionLabel}>Pagamento</Typography>

            <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2, mb: 2 }}>
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
                            MenuProps={{ slotProps: { paper: { sx: selectMenuPaperSx } } }}
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

                <Box sx={{ flex: 1 }}>
                    <Typography sx={labelStyles}>Categoria</Typography>
                    <Controller
                        name="category_id"
                        control={control}
                        render={({ field }) => {
                            const selectedCategory = categories.find((category) => category.id === field.value);
                            const Icon = selectedCategory ? getCategoryIcon(selectedCategory.name) : getCategoryIcon('default');

                            return (
                                <FormControl fullWidth>
                                    <Select
                                        value={field.value || ''}
                                        onChange={(event) => field.onChange(event.target.value)}
                                        displayEmpty
                                        renderValue={() => (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Icon size={18} color={selectedCategory?.color || colors.textMuted} />
                                                <Typography
                                                    sx={{
                                                        fontSize: '13px',
                                                        color: selectedCategory ? colors.textPrimary : colors.textMuted,
                                                    }}
                                                >
                                                    {selectedCategory?.name || 'Selecione'}
                                                </Typography>
                                            </Box>
                                        )}
                                        sx={{
                                            ...inputStyles['& .MuiOutlinedInput-root'],
                                            '& .MuiSelect-icon': { color: colors.textMuted },
                                        }}
                                        MenuProps={{ slotProps: { paper: { sx: scrollableSelectMenuPaperSx } } }}
                                    >
                                        {filteredCategories.map((category) => {
                                            const CategoryIcon = getCategoryIcon(category.name);
                                            return (
                                                <MenuItem
                                                    key={category.id}
                                                    value={category.id}
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
                                                    <CategoryIcon size={18} color={category.color} />
                                                    {category.name}
                                                </MenuItem>
                                            );
                                        })}
                                    </Select>
                                </FormControl>
                            );
                        }}
                    />
                </Box>
            </Box>

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: isMobile
                        ? '1fr'
                        : paymentMethod === 'credit'
                            ? '1fr 1fr 1fr'
                            : '1fr 1fr',
                    gap: 1.5,
                }}
            >
                <Box>
                    <Typography sx={labelStyles}>Conta *</Typography>
                    <FormControl fullWidth error={Boolean(errors.account_id)}>
                        <Select
                            {...register('account_id')}
                            defaultValue={transaction?.account_id || ''}
                            displayEmpty
                            sx={{
                                ...inputStyles['& .MuiOutlinedInput-root'],
                                '& .MuiSelect-icon': { color: colors.textMuted },
                            }}
                            MenuProps={{ slotProps: { paper: { sx: selectMenuPaperSx } } }}
                        >
                            <MenuItem value="" disabled sx={{ fontSize: '13px', color: colors.textMuted }}>
                                Selecione...
                            </MenuItem>
                            {accounts.map((account) => {
                                const AccountIcon = getAccountIcon(account.type);
                                return (
                                    <MenuItem
                                        key={account.id}
                                        value={account.id}
                                        sx={{ fontSize: '13px', py: 1.25, borderRadius: '6px', mx: 0.5 }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <AccountIcon size={18} color={account.color} />
                                            {account.name}
                                        </Box>
                                    </MenuItem>
                                );
                            })}
                        </Select>
                        {errors.account_id && (
                            <FormHelperText sx={{ color: colors.red, fontSize: '11px' }}>
                                {String(errors.account_id.message ?? '')}
                            </FormHelperText>
                        )}
                    </FormControl>
                </Box>

                {paymentMethod === 'credit' && (
                    <Box>
                        <Typography sx={labelStyles}>Cartão *</Typography>
                        <FormControl fullWidth error={Boolean(errors.card_id)}>
                            <Select
                                {...register('card_id')}
                                defaultValue={transaction?.card_id || ''}
                                displayEmpty
                                disabled={!watch('account_id')}
                                sx={{
                                    ...inputStyles['& .MuiOutlinedInput-root'],
                                    '& .MuiSelect-icon': { color: colors.textMuted },
                                }}
                                MenuProps={{ slotProps: { paper: { sx: selectMenuPaperSx } } }}
                            >
                                <MenuItem value="" disabled sx={{ fontSize: '13px', color: colors.textMuted }}>
                                    Selecione...
                                </MenuItem>
                                {cards.map((card) => (
                                    <MenuItem
                                        key={card.id}
                                        value={card.id}
                                        sx={{ fontSize: '13px', py: 1.25, borderRadius: '6px', mx: 0.5 }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <CardIcon size={18} color={card.color} />
                                            {card.name}
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                )}

                <Box>
                    <Typography sx={labelStyles}>Data *</Typography>
                    <TransactionDateField control={control} />
                </Box>
            </Box>
        </Box>
    );
}
