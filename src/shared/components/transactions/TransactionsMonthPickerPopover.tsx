import { Box, IconButton, Popover, Typography } from '@mui/material';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { colors } from '@/shared/theme';

const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

interface TransactionsMonthPickerPopoverProps {
    open: boolean;
    monthAnchor: HTMLElement | null;
    setMonthAnchor: (anchor: HTMLElement | null) => void;
    pickerYear: number;
    setPickerYear: React.Dispatch<React.SetStateAction<number>>;
    currentMonth: Date;
    onSelectMonth: (monthIndex: number) => void;
}

export function TransactionsMonthPickerPopover({
    open,
    monthAnchor,
    setMonthAnchor,
    pickerYear,
    setPickerYear,
    currentMonth,
    onSelectMonth,
}: TransactionsMonthPickerPopoverProps) {
    return (
        <Popover
            open={open}
            anchorEl={monthAnchor}
            onClose={() => setMonthAnchor(null)}
            hideBackdrop
            disableScrollLock
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

            <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 0.5,
            }}>
                {months.map((monthLabel, index) => {
                    const isCurrentMonth = currentMonth.getMonth() === index && currentMonth.getFullYear() === pickerYear;
                    const isToday = new Date().getMonth() === index && new Date().getFullYear() === pickerYear;

                    return (
                        <Box
                            key={monthLabel}
                            component="button"
                            onClick={() => onSelectMonth(index)}
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
                            {monthLabel}
                        </Box>
                    );
                })}
            </Box>
        </Popover>
    );
}
