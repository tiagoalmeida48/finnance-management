import { useState } from 'react';
import { Box, Stack, Typography, IconButton, Popover } from '@mui/material';
import { ChevronLeft, ChevronRight, CreditCard } from 'lucide-react';
import { colors } from '@/shared/theme';

interface TransactionsFilterProps {
    typeFilter: string | null;
    setTypeFilter: (val: string | null) => void;
    showPendingOnly: boolean;
    setShowPendingOnly: (val: boolean) => void;
    showAllTime: boolean;
    setShowAllTime: (val: boolean) => void;
    currentMonth: Date;
    setCurrentMonth: (date: Date) => void;
    hideCreditCards: boolean;
    setHideCreditCards: (val: boolean) => void;
    handlePrevMonth: () => void;
    handleNextMonth: () => void;
}

const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const monthsFull = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

interface TabButtonProps {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}

function TabButton({ active, onClick, children }: TabButtonProps) {
    return (
        <Box
            component="button"
            onClick={onClick}
            sx={{
                px: 2,
                py: 0.75,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontFamily: '"DM Sans"',
                fontWeight: active ? 600 : 500,
                bgcolor: active ? colors.accent : 'transparent',
                color: active ? colors.bgPrimary : colors.textSecondary,
                transition: 'all 200ms ease',
                '&:hover': {
                    bgcolor: active ? colors.accent : 'rgba(255,255,255,0.04)',
                },
            }}
        >
            {children}
        </Box>
    );
}

export function TransactionsFilter({
    typeFilter, setTypeFilter,
    showPendingOnly, setShowPendingOnly,
    showAllTime, setShowAllTime,
    currentMonth, setCurrentMonth,
    hideCreditCards, setHideCreditCards,
    handlePrevMonth, handleNextMonth
}: TransactionsFilterProps) {
    const [monthAnchor, setMonthAnchor] = useState<HTMLElement | null>(null);
    const [pickerYear, setPickerYear] = useState(currentMonth.getFullYear());

    const handleOpenMonthPicker = (e: React.MouseEvent<HTMLElement>) => {
        setPickerYear(currentMonth.getFullYear());
        setMonthAnchor(e.currentTarget);
    };

    const handleSelectMonth = (monthIndex: number) => {
        setCurrentMonth(new Date(pickerYear, monthIndex, 1));
        setMonthAnchor(null);
    };

    return (
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
            gap: 2,
        }}>
            {/* Left: Type tabs + Status tabs */}
            <Stack direction="row" spacing={1} alignItems="center">
                {/* Type Tabs: Receitas | Despesas | Transf. */}
                <Box sx={{
                    display: 'flex',
                    gap: 0.5,
                    bgcolor: colors.bgCard,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '10px',
                    p: '3px',
                }}>
                    <TabButton
                        active={typeFilter === 'income'}
                        onClick={() => setTypeFilter(typeFilter === 'income' ? null : 'income')}
                    >
                        Receitas
                    </TabButton>
                    <TabButton
                        active={typeFilter === 'expense'}
                        onClick={() => setTypeFilter(typeFilter === 'expense' ? null : 'expense')}
                    >
                        Despesas
                    </TabButton>
                    <TabButton
                        active={typeFilter === 'transfer'}
                        onClick={() => setTypeFilter(typeFilter === 'transfer' ? null : 'transfer')}
                    >
                        Transf.
                    </TabButton>
                </Box>

                {/* Status Tabs: Todos | Pendentes */}
                <Box sx={{
                    display: 'flex',
                    gap: 0.5,
                    bgcolor: colors.bgCard,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '10px',
                    p: '3px',
                }}>
                    <TabButton
                        active={!showPendingOnly}
                        onClick={() => setShowPendingOnly(false)}
                    >
                        Todos
                    </TabButton>
                    <TabButton
                        active={showPendingOnly}
                        onClick={() => setShowPendingOnly(true)}
                    >
                        Pendentes
                    </TabButton>
                </Box>
            </Stack>

            {/* Right side */}
            <Stack direction="row" spacing={1} alignItems="center">
                {/* Hide Credit Cards */}
                <Box
                    onClick={() => setHideCreditCards(!hideCreditCards)}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 1.5,
                        py: 0.75,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        border: `1px solid ${hideCreditCards ? colors.accent : colors.border}`,
                        bgcolor: hideCreditCards ? colors.accentGlow : colors.bgCard,
                        transition: 'all 200ms ease',
                        userSelect: 'none',
                        '&:hover': {
                            borderColor: hideCreditCards ? colors.accent : 'rgba(255,255,255,0.15)',
                        },
                    }}
                >
                    <CreditCard size={14} color={hideCreditCards ? colors.accent : colors.textMuted} />
                    <Typography sx={{
                        fontSize: '12px',
                        fontWeight: 500,
                        color: hideCreditCards ? colors.accent : colors.textSecondary,
                        whiteSpace: 'nowrap',
                    }}>
                        Ocultar Cartão
                    </Typography>
                </Box>

                {/* Period Tabs */}
                <Box sx={{
                    display: 'flex',
                    gap: 0.5,
                    bgcolor: colors.bgCard,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '10px',
                    p: '3px',
                }}>
                    <TabButton
                        active={!showAllTime}
                        onClick={() => setShowAllTime(false)}
                    >
                        Mês
                    </TabButton>
                    <TabButton
                        active={showAllTime}
                        onClick={() => setShowAllTime(true)}
                    >
                        Geral
                    </TabButton>
                </Box>

                {/* Date Selector */}
                {!showAllTime && (
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        bgcolor: colors.bgCard,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '10px',
                        px: 0.5,
                        py: '3px',
                    }}>
                        <IconButton
                            size="small"
                            onClick={handlePrevMonth}
                            sx={{
                                width: 28,
                                height: 28,
                                borderRadius: '7px',
                                color: colors.textSecondary,
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
                            }}
                        >
                            <ChevronLeft size={15} />
                        </IconButton>
                        <Typography
                            onClick={handleOpenMonthPicker}
                            sx={{
                                fontSize: '13px',
                                fontFamily: '"Plus Jakarta Sans"',
                                fontWeight: 600,
                                color: colors.textPrimary,
                                minWidth: 120,
                                textAlign: 'center',
                                userSelect: 'none',
                                cursor: 'pointer',
                                borderRadius: '6px',
                                py: 0.25,
                                px: 1,
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' },
                            }}
                        >
                            {monthsFull[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </Typography>
                        <IconButton
                            size="small"
                            onClick={handleNextMonth}
                            sx={{
                                width: 28,
                                height: 28,
                                borderRadius: '7px',
                                color: colors.textSecondary,
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
                            }}
                        >
                            <ChevronRight size={15} />
                        </IconButton>
                    </Box>
                )}

                {/* Month Picker Popover */}
                <Popover
                    open={Boolean(monthAnchor)}
                    anchorEl={monthAnchor}
                    onClose={() => setMonthAnchor(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                    slotProps={{
                        paper: {
                            sx: {
                                mt: 1,
                                bgcolor: colors.bgCard,
                                border: `1px solid ${colors.border}`,
                                borderRadius: '12px',
                                p: 2,
                                width: 280,
                            }
                        }
                    }}
                >
                    {/* Year selector */}
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 1.5,
                    }}>
                        <IconButton
                            size="small"
                            onClick={() => setPickerYear(y => y - 1)}
                            sx={{
                                width: 28,
                                height: 28,
                                borderRadius: '7px',
                                color: colors.textSecondary,
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
                            }}
                        >
                            <ChevronLeft size={15} />
                        </IconButton>
                        <Typography sx={{
                            fontSize: '14px',
                            fontFamily: '"Plus Jakarta Sans"',
                            fontWeight: 700,
                            color: colors.textPrimary,
                        }}>
                            {pickerYear}
                        </Typography>
                        <IconButton
                            size="small"
                            onClick={() => setPickerYear(y => y + 1)}
                            sx={{
                                width: 28,
                                height: 28,
                                borderRadius: '7px',
                                color: colors.textSecondary,
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
                            }}
                        >
                            <ChevronRight size={15} />
                        </IconButton>
                    </Box>

                    {/* Month grid 4x3 */}
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: 0.5,
                    }}>
                        {months.map((m, i) => {
                            const isCurrentMonth = currentMonth.getMonth() === i && currentMonth.getFullYear() === pickerYear;
                            const isToday = new Date().getMonth() === i && new Date().getFullYear() === pickerYear;
                            return (
                                <Box
                                    key={m}
                                    component="button"
                                    onClick={() => handleSelectMonth(i)}
                                    sx={{
                                        py: 1,
                                        px: 0.5,
                                        borderRadius: '8px',
                                        border: isToday && !isCurrentMonth ? `1px solid ${colors.border}` : '1px solid transparent',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        fontFamily: '"DM Sans"',
                                        fontWeight: isCurrentMonth ? 600 : 500,
                                        bgcolor: isCurrentMonth ? colors.accent : 'transparent',
                                        color: isCurrentMonth ? colors.bgPrimary : colors.textSecondary,
                                        transition: 'all 150ms ease',
                                        '&:hover': {
                                            bgcolor: isCurrentMonth ? colors.accent : 'rgba(255,255,255,0.06)',
                                        },
                                    }}
                                >
                                    {m}
                                </Box>
                            );
                        })}
                    </Box>
                </Popover>
            </Stack>
        </Box>
    );
}
