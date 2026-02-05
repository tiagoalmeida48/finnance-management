import { Box, Grid, Stack, ToggleButtonGroup, ToggleButton, FormControl, Select, MenuItem, InputLabel, TextField, InputAdornment, Checkbox, FormControlLabel, Typography, IconButton } from '@mui/material';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface TransactionsFilterProps {
    typeFilter: string | null;
    setTypeFilter: (val: string | null) => void;
    showPendingOnly: boolean;
    setShowPendingOnly: (val: boolean) => void;
    showAllTime: boolean;
    setShowAllTime: (val: boolean) => void;
    currentMonth: Date;
    setCurrentMonth: (date: Date) => void;
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    hideCreditCards: boolean;
    setHideCreditCards: (val: boolean) => void;
    categoryFilter: string;
    setCategoryFilter: (val: string) => void;
    paymentMethodFilter: string;
    setPaymentMethodFilter: (val: string) => void;
    categories?: { id: string, name: string }[];
    handlePrevMonth: () => void;
    handleNextMonth: () => void;
}

export function TransactionsFilter({
    typeFilter, setTypeFilter,
    showPendingOnly, setShowPendingOnly,
    showAllTime, setShowAllTime,
    currentMonth, setCurrentMonth,
    searchQuery, setSearchQuery,
    hideCreditCards, setHideCreditCards,
    categoryFilter, setCategoryFilter,
    paymentMethodFilter, setPaymentMethodFilter,
    categories,
    handlePrevMonth, handleNextMonth
}: TransactionsFilterProps) {
    return (
        <Box sx={{ p: 2, borderBottom: '1px solid #2A2A2A' }}>
            <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 4 }}>
                    <ToggleButtonGroup
                        size="small"
                        value={typeFilter}
                        exclusive
                        onChange={(_, value) => setTypeFilter(value)}
                        fullWidth
                        sx={{ borderColor: '#2A2A2A' }}
                    >
                        <ToggleButton value="income" sx={{ px: 2, flex: 1 }}>Receitas</ToggleButton>
                        <ToggleButton value="expense" sx={{ px: 2, flex: 1 }}>Despesas</ToggleButton>
                        <ToggleButton value="transfer" sx={{ px: 2, flex: 1 }}>Transf.</ToggleButton>
                    </ToggleButtonGroup>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Stack direction="row" spacing={1}>
                        <ToggleButtonGroup
                            size="small"
                            value={showPendingOnly ? 'pending' : 'all'}
                            exclusive
                            onChange={(_, value) => { if (value !== null) setShowPendingOnly(value === 'pending'); }}
                            fullWidth
                            sx={{ borderColor: '#2A2A2A' }}
                        >
                            <ToggleButton value="all" sx={{ px: 2, flex: 1 }}>Todos</ToggleButton>
                            <ToggleButton value="pending" sx={{ px: 2, flex: 1 }}>Pendentes</ToggleButton>
                        </ToggleButtonGroup>

                        <ToggleButtonGroup
                            size="small"
                            value={showAllTime ? 'all' : 'monthly'}
                            exclusive
                            onChange={(_, value) => { if (value !== null) setShowAllTime(value === 'all'); }}
                            sx={{ borderColor: '#2A2A2A' }}
                        >
                            <ToggleButton value="monthly" sx={{ px: 2 }}>Mês</ToggleButton>
                            <ToggleButton value="all" sx={{ px: 2 }}>Geral</ToggleButton>
                        </ToggleButtonGroup>
                    </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    {!showAllTime && (
                        <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={1}>
                            <FormControl size="small" sx={{ minWidth: 130 }}>
                                <Select
                                    value={currentMonth.getMonth()}
                                    onChange={(e) => {
                                        const newDate = new Date(currentMonth);
                                        newDate.setMonth(e.target.value as number);
                                        setCurrentMonth(newDate);
                                    }}
                                    sx={{ bgcolor: 'rgba(255,255,255,0.02)', '& fieldset': { borderColor: '#2A2A2A' }, fontSize: '0.85rem' }}
                                >
                                    {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map((month, idx) => (
                                        <MenuItem key={idx} value={idx}>{month}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl size="small" sx={{ minWidth: 100 }}>
                                <Select
                                    value={currentMonth.getFullYear()}
                                    onChange={(e) => {
                                        const newDate = new Date(currentMonth);
                                        newDate.setFullYear(e.target.value as number);
                                        setCurrentMonth(newDate);
                                    }}
                                    sx={{ bgcolor: 'rgba(255,255,255,0.02)', '& fieldset': { borderColor: '#2A2A2A' }, fontSize: '0.85rem' }}
                                >
                                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                                        <MenuItem key={year} value={year}>{year}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Stack direction="row">
                                <IconButton size="small" onClick={handlePrevMonth}><ChevronLeft size={18} /></IconButton>
                                <IconButton size="small" onClick={handleNextMonth}><ChevronRight size={18} /></IconButton>
                            </Stack>
                        </Stack>
                    )}
                </Grid>
            </Grid>

            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <TextField
                                size="small"
                                placeholder="Buscar descrição..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                fullWidth
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search size={18} style={{ opacity: 0.5 }} />
                                            </InputAdornment>
                                        ),
                                    }
                                }}
                                sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255,255,255,0.02)', '& fieldset': { borderColor: '#2A2A2A' } } }}
                            />
                            <FormControlLabel
                                control={<Checkbox size="small" checked={hideCreditCards} onChange={(e) => setHideCreditCards(e.target.checked)} sx={{ color: '#2A2A2A', '&.Mui-checked': { color: 'primary.main' } }} />}
                                label={<Typography variant="caption" sx={{ whiteSpace: 'nowrap', opacity: 0.8 }}>Ocultar Cartão</Typography>}
                            />
                        </Stack>
                    </Grid>
                    <Grid size={{ xs: 6, md: 2 }}>
                        <FormControl size="small" fullWidth>
                            <InputLabel id="category-filter-label" sx={{ fontSize: '0.85rem' }}>Categoria</InputLabel>
                            <Select labelId="category-filter-label" value={categoryFilter} label="Categoria" onChange={(e) => setCategoryFilter(e.target.value)} sx={{ bgcolor: 'rgba(255,255,255,0.02)', '& fieldset': { borderColor: '#2A2A2A' } }}>
                                <MenuItem value="all">Todas</MenuItem>
                                {categories?.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 6, md: 2 }}>
                        <FormControl size="small" fullWidth>
                            <InputLabel id="payment-method-filter-label" sx={{ fontSize: '0.85rem' }}>Método</InputLabel>
                            <Select labelId="payment-method-filter-label" value={paymentMethodFilter} label="Método" onChange={(e) => setPaymentMethodFilter(e.target.value)} sx={{ bgcolor: 'rgba(255,255,255,0.02)', '& fieldset': { borderColor: '#2A2A2A' } }}>
                                <MenuItem value="all">Todos</MenuItem>
                                <MenuItem value="credit">Cartão de Crédito</MenuItem>
                                <MenuItem value="debit">Débito</MenuItem>
                                <MenuItem value="pix">PIX</MenuItem>
                                <MenuItem value="money">Dinheiro</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}
