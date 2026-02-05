import { Stack, ToggleButtonGroup, ToggleButton, FormControl, Select, MenuItem, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DashboardFiltersProps {
    filterType: 'monthly' | 'general' | 'custom';
    setFilterType: (val: 'monthly' | 'general' | 'custom') => void;
    currentDate: Date;
    setCurrentDate: (date: Date) => void;
    handlePrevMonth: () => void;
    handleNextMonth: () => void;
}

export function DashboardFilters({
    filterType, setFilterType,
    currentDate, setCurrentDate,
    handlePrevMonth, handleNextMonth
}: DashboardFiltersProps) {
    return (
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
            <ToggleButtonGroup
                size="small"
                value={filterType}
                exclusive
                onChange={(_, value) => { if (value !== null) setFilterType(value); }}
                sx={{ bgcolor: 'rgba(255,255,255,0.02)', '& .MuiToggleButton-root': { px: 2, borderColor: '#2A2A2A' } }}
            >
                <ToggleButton value="monthly">Mês</ToggleButton>
                <ToggleButton value="general">Geral</ToggleButton>
                <ToggleButton value="custom">Histórico</ToggleButton>
            </ToggleButtonGroup>

            {filterType === 'monthly' && (
                <Stack direction="row" alignItems="center" spacing={1}>
                    <FormControl size="small" sx={{ minWidth: 130 }}>
                        <Select
                            value={currentDate.getMonth()}
                            onChange={(e) => {
                                const d = new Date(currentDate);
                                d.setMonth(e.target.value as number);
                                setCurrentDate(d);
                            }}
                            sx={{ bgcolor: 'rgba(255,255,255,0.02)', '& fieldset': { borderColor: '#2A2A2A' }, fontSize: '0.85rem' }}
                        >
                            {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map((m, i) => (
                                <MenuItem key={i} value={i}>{m}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 100 }}>
                        <Select
                            value={currentDate.getFullYear()}
                            onChange={(e) => {
                                const d = new Date(currentDate);
                                d.setFullYear(e.target.value as number);
                                setCurrentDate(d);
                            }}
                            sx={{ bgcolor: 'rgba(255,255,255,0.02)', '& fieldset': { borderColor: '#2A2A2A' }, fontSize: '0.85rem' }}
                        >
                            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
                                <MenuItem key={y} value={y}>{y}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Stack direction="row">
                        <IconButton size="small" onClick={handlePrevMonth} sx={{ border: '1px solid #2A2A2A', borderRadius: 1, mr: 0.5 }}><ChevronLeft size={18} /></IconButton>
                        <IconButton size="small" onClick={handleNextMonth} sx={{ border: '1px solid #2A2A2A', borderRadius: 1 }}><ChevronRight size={18} /></IconButton>
                    </Stack>
                </Stack>
            )}
        </Stack>
    );
}
