import { Box, Checkbox, FormControl, InputAdornment, MenuItem, Select, TableCell, TableHead, TableRow, TableSortLabel, TextField, Typography } from '@mui/material';
import { Search } from 'lucide-react';
import type { Transaction } from '../../services/transactions.service';
import { colors } from '@/shared/theme';

const sortLabelSx = {
    '&.Mui-active': { color: colors.accent },
    '& .MuiTableSortLabel-icon': {
        color: `${colors.accent} !important`,
        fontSize: 12,
    },
};

const inlineSelectSx = {
    height: 28,
    borderRadius: '6px',
    bgcolor: colors.bgSecondary,
    fontSize: '12px',
    color: colors.textSecondary,
    '& fieldset': { border: 'none' },
    '& .MuiSelect-icon': { color: colors.textMuted, fontSize: 16 },
    '& .MuiSelect-select': {
        py: '2px',
        px: '6px',
    },
};

interface TransactionsTableHeaderProps {
    selectAllChecked: boolean;
    selectAllIndeterminate: boolean;
    handleSelectAll: (checked: boolean) => void;
    handleSort: (field: keyof Transaction | 'amount' | 'payment_date' | 'is_paid' | 'payment_method') => void;
    sortConfig: { field: string; direction: 'asc' | 'desc' };
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    categoryFilter: string;
    setCategoryFilter: (value: string) => void;
    paymentMethodFilter: string;
    setPaymentMethodFilter: (value: string) => void;
    categories?: { id: string; name: string }[];
}

export function TransactionsTableHeader({
    selectAllChecked,
    selectAllIndeterminate,
    handleSelectAll,
    handleSort,
    sortConfig,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    paymentMethodFilter,
    setPaymentMethodFilter,
    categories,
}: TransactionsTableHeaderProps) {
    const isActiveSort = (field: string) => sortConfig.field === field;

    return (
        <TableHead>
            <TableRow sx={{
                bgcolor: colors.bgSecondary,
                borderBottom: `1px solid ${colors.border}`,
            }}>
                <TableCell padding="checkbox" sx={{ py: 1.5, pl: 2 }}>
                    <Checkbox
                        size="small"
                        checked={selectAllChecked}
                        indeterminate={selectAllIndeterminate}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        sx={{
                            width: 18,
                            height: 18,
                            '& .MuiSvgIcon-root': { fontSize: 18 },
                            color: 'rgba(255,255,255,0.15)',
                            '&.Mui-checked': { color: colors.accent },
                        }}
                    />
                </TableCell>
                <TableCell sx={{ width: 48 }} />

                <TableCell sx={{ py: 1.5 }}>
                    <TableSortLabel
                        active={isActiveSort('payment_date')}
                        direction={sortConfig.direction}
                        onClick={() => handleSort('payment_date')}
                        sx={sortLabelSx}
                    >
                        <Typography sx={{
                            fontSize: '11px',
                            fontFamily: '"DM Sans"',
                            fontWeight: 600,
                            color: isActiveSort('payment_date') ? colors.accent : colors.textMuted,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                        }}>
                            Data
                        </Typography>
                    </TableSortLabel>
                </TableCell>

                <TableCell sx={{ py: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TableSortLabel
                            active={isActiveSort('description')}
                            direction={sortConfig.direction}
                            onClick={() => handleSort('description')}
                            sx={sortLabelSx}
                        >
                            <Typography sx={{
                                fontSize: '11px',
                                fontFamily: '"DM Sans"',
                                fontWeight: 600,
                                color: isActiveSort('description') ? colors.accent : colors.textMuted,
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                            }}>
                                Descrição
                            </Typography>
                        </TableSortLabel>
                        <TextField
                            size="small"
                            placeholder="Filtrar..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search size={12} color={colors.textMuted} />
                                        </InputAdornment>
                                    ),
                                }
                            }}
                            sx={{
                                maxWidth: 160,
                                '& .MuiOutlinedInput-root': {
                                    height: 28,
                                    borderRadius: '6px',
                                    '& fieldset': { borderColor: 'rgba(255,255,255,0.06)' },
                                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
                                    '&.Mui-focused fieldset': {
                                        borderColor: colors.accent,
                                        borderWidth: '1px',
                                    },
                                },
                                '& .MuiInputBase-input': {
                                    fontSize: '11px',
                                    py: '3px',
                                    '&::placeholder': { color: colors.textMuted, opacity: 1 },
                                },
                            }}
                        />
                    </Box>
                </TableCell>

                <TableCell sx={{ py: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <TableSortLabel
                            active={isActiveSort('category_id')}
                            direction={sortConfig.direction}
                            onClick={() => handleSort('category_id')}
                            sx={sortLabelSx}
                        >
                            <Typography sx={{
                                fontSize: '11px',
                                fontFamily: '"DM Sans"',
                                fontWeight: 600,
                                color: isActiveSort('category_id') ? colors.accent : colors.textMuted,
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                            }}>
                                Categoria
                            </Typography>
                        </TableSortLabel>
                        <FormControl size="small">
                            <Select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                sx={{
                                    ...inlineSelectSx,
                                    color: categoryFilter !== 'all' ? colors.accent : colors.textMuted,
                                }}
                            >
                                <MenuItem value="all">Todas</MenuItem>
                                {categories?.map((category) => <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Box>
                </TableCell>

                <TableCell sx={{ py: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <TableSortLabel
                            active={isActiveSort('payment_method')}
                            direction={sortConfig.direction}
                            onClick={() => handleSort('payment_method')}
                            sx={sortLabelSx}
                        >
                            <Typography sx={{
                                fontSize: '11px',
                                fontFamily: '"DM Sans"',
                                fontWeight: 600,
                                color: isActiveSort('payment_method') ? colors.accent : colors.textMuted,
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                            }}>
                                Pagamento
                            </Typography>
                        </TableSortLabel>
                        <FormControl size="small">
                            <Select
                                value={paymentMethodFilter}
                                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                                sx={{
                                    ...inlineSelectSx,
                                    color: paymentMethodFilter !== 'all' ? colors.accent : colors.textMuted,
                                }}
                            >
                                <MenuItem value="all">Todos</MenuItem>
                                <MenuItem value="credit">Cartão de Crédito</MenuItem>
                                <MenuItem value="debit">Débito</MenuItem>
                                <MenuItem value="pix">PIX</MenuItem>
                                <MenuItem value="money">Dinheiro</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </TableCell>

                <TableCell align="right" sx={{ py: 1.5 }}>
                    <TableSortLabel
                        active={isActiveSort('amount')}
                        direction={sortConfig.direction}
                        onClick={() => handleSort('amount')}
                        sx={sortLabelSx}
                    >
                        <Typography sx={{
                            fontSize: '11px',
                            fontFamily: '"DM Sans"',
                            fontWeight: 600,
                            color: isActiveSort('amount') ? colors.accent : colors.textMuted,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                        }}>
                            Valor
                        </Typography>
                    </TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ width: 48 }} />
            </TableRow>
        </TableHead>
    );
}
