import { Box, FormControl, InputAdornment, MenuItem, Select, TextField, Stack } from '@mui/material';
import { Search } from 'lucide-react';
import { colors } from '@/shared/theme';

interface TransactionsMobileFiltersProps {
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    categoryFilter: string;
    setCategoryFilter: (value: string) => void;
    paymentMethodFilter: string;
    setPaymentMethodFilter: (value: string) => void;
    accountFilter: string;
    setAccountFilter: (value: string) => void;
    cardFilter: string;
    setCardFilter: (value: string) => void;
    categories?: { id: string; name: string }[];
    accounts?: { id: string; name: string }[];
    cards?: { id: string; name: string }[];
}

const selectSx = {
    height: 36,
    borderRadius: '8px',
    bgcolor: colors.bgSecondary,
    fontSize: '13px',
    color: colors.textSecondary,
    '& fieldset': { border: `1px solid ${colors.border}` },
    '&:hover fieldset': { borderColor: colors.accent },
    '&.Mui-focused fieldset': { borderColor: colors.accent },
    '& .MuiSelect-icon': { color: colors.textMuted },
};

export function TransactionsMobileFilters({
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    paymentMethodFilter,
    setPaymentMethodFilter,
    accountFilter,
    setAccountFilter,
    cardFilter,
    setCardFilter,
    categories,
    accounts,
    cards,
}: TransactionsMobileFiltersProps) {
    return (
        <Stack spacing={2} sx={{ mb: 2, p: 1 }}>
            {/* Search Bar */}
            <TextField
                fullWidth
                size="small"
                placeholder="Buscar por descrição..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search size={16} color={colors.textMuted} />
                            </InputAdornment>
                        ),
                    }
                }}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        height: 40,
                        borderRadius: '10px',
                        bgcolor: colors.bgSecondary,
                        '& fieldset': { borderColor: colors.border },
                        '&:hover fieldset': { borderColor: colors.accent },
                        '&.Mui-focused fieldset': { borderColor: colors.accent },
                    },
                    '& .MuiInputBase-input': { color: colors.textPrimary },
                }}
            />

            {/* Filters Grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                <FormControl size="small" fullWidth>
                    <Select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        displayEmpty
                        sx={{ ...selectSx, color: categoryFilter !== 'all' ? colors.accent : colors.textMuted }}
                    >
                        <MenuItem value="all">Todas Categorias</MenuItem>
                        {categories?.map((category) => <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>)}
                    </Select>
                </FormControl>

                <FormControl size="small" fullWidth>
                    <Select
                        value={paymentMethodFilter}
                        onChange={(e) => setPaymentMethodFilter(e.target.value)}
                        displayEmpty
                        sx={{ ...selectSx, color: paymentMethodFilter !== 'all' ? colors.accent : colors.textMuted }}
                    >
                        <MenuItem value="all">Todos Pagamentos</MenuItem>
                        <MenuItem value="credit">Crédito</MenuItem>
                        <MenuItem value="debit">Débito</MenuItem>
                        <MenuItem value="pix">PIX</MenuItem>
                        <MenuItem value="money">Dinheiro</MenuItem>
                        <MenuItem value="bill_payment">Pagamento Fatura</MenuItem>
                    </Select>
                </FormControl>

                <FormControl size="small" fullWidth>
                    <Select
                        value={accountFilter}
                        onChange={(e) => setAccountFilter(e.target.value)}
                        displayEmpty
                        sx={{ ...selectSx, color: accountFilter !== 'all' ? colors.accent : colors.textMuted }}
                    >
                        <MenuItem value="all">Todas Contas</MenuItem>
                        {accounts?.map((account) => <MenuItem key={account.id} value={account.id}>{account.name}</MenuItem>)}
                    </Select>
                </FormControl>

                <FormControl size="small" fullWidth>
                    <Select
                        value={cardFilter}
                        onChange={(e) => setCardFilter(e.target.value)}
                        displayEmpty
                        sx={{ ...selectSx, color: cardFilter !== 'all' ? colors.accent : colors.textMuted }}
                    >
                        <MenuItem value="all">Todos Cartões</MenuItem>
                        {cards?.map((card) => <MenuItem key={card.id} value={card.id}>{card.name}</MenuItem>)}
                    </Select>
                </FormControl>
            </Box>
        </Stack>
    );
}
