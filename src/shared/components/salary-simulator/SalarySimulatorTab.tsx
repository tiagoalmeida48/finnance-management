import { Alert, Box, Button, Card, CardContent, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { Clock3 } from 'lucide-react';
import type { SalarySetting } from '@/shared/interfaces';
import { calculatePayroll } from '@/shared/utils/payroll-calculations';
import { colors } from '@/shared/theme';
import { buildSettingKey, formatCurrency, formatDateBR } from './salarySimulator.helpers';

interface SalarySimulatorTabProps {
    availableSettings: SalarySetting[];
    currentSetting: SalarySetting | null | undefined;
    selectedSettingInputKey: string;
    onSelectedSettingChange: (value: string) => void;
    totalHours: string;
    onHoursChange: (value: string) => void;
    onHoursBlur: () => void;
    payroll: ReturnType<typeof calculatePayroll>;
    isNetNegative: boolean;
    calculationSetting: SalarySetting | null | undefined;
    today: string;
    currentHourlyRate: number;
    currentBaseSalary: number;
    inssLabel: string;
    adminFeeLabel: string;
    inssDisplay: number;
    adminDisplay: number;
    isTemporaryCalculation: boolean;
    onOpenLaunchSalaryDialog: () => void;
}

export function SalarySimulatorTab({
    availableSettings,
    currentSetting,
    selectedSettingInputKey,
    onSelectedSettingChange,
    totalHours,
    onHoursChange,
    onHoursBlur,
    payroll,
    isNetNegative,
    calculationSetting,
    today,
    currentHourlyRate,
    currentBaseSalary,
    inssLabel,
    adminFeeLabel,
    inssDisplay,
    adminDisplay,
    isTemporaryCalculation,
    onOpenLaunchSalaryDialog,
}: SalarySimulatorTabProps) {
    return (
        <Grid size={{ xs: 12 }}>
            <Grid container spacing={2.25} alignItems="stretch">
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ borderRadius: '14px', height: '100%' }}>
                        <CardContent sx={{ p: { xs: 2.25, md: 2.75 } }}>
                            <Stack spacing={2}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Clock3 size={18} color={colors.accent} />
                                    <Typography sx={{ fontWeight: 700, fontFamily: '"Plus Jakarta Sans"' }}>
                                        Simulador
                                    </Typography>
                                </Stack>

                                <Stack spacing={1.75}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Vigência usada no cálculo"
                                        value={selectedSettingInputKey}
                                        onChange={(event) => onSelectedSettingChange(event.target.value)}
                                        sx={{ '& .MuiFormHelperText-root': { mt: 0.75 } }}
                                    >
                                        {availableSettings.map((setting) => {
                                            const key = buildSettingKey(setting);
                                            const isCurrent = currentSetting ? key === buildSettingKey(currentSetting) : false;
                                            return (
                                                <MenuItem key={key} value={key}>
                                                    {formatDateBR(setting.date_start)} ate {formatDateBR(setting.date_end)}{isCurrent ? ' (Vigente)' : ''}
                                                </MenuItem>
                                            );
                                        })}
                                    </TextField>

                                    <TextField
                                        label="Total de Horas"
                                        type="number"
                                        fullWidth
                                        value={totalHours}
                                        onChange={(event) => onHoursChange(event.target.value)}
                                        onFocus={(event) => event.target.select()}
                                        onBlur={onHoursBlur}
                                        slotProps={{ htmlInput: { min: 0, step: '0.1' } }}
                                        sx={{ '& .MuiFormHelperText-root': { mt: 0.75 } }}
                                    />
                                </Stack>

                                <Box
                                    sx={{
                                        p: 1.5,
                                        borderRadius: '12px',
                                        border: `1.5px solid ${isNetNegative ? 'rgba(235, 118, 118, 0.8)' : colors.accent}`,
                                        background: isNetNegative ? colors.redBg : colors.accentGlow,
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: 1.2,
                                        boxShadow: isNetNegative
                                            ? '0 8px 20px rgba(235, 118, 118, 0.18)'
                                            : '0 8px 24px rgba(201, 168, 76, 0.22)',
                                    }}
                                >
                                    <Typography sx={{ fontSize: 22, color: colors.textSecondary, fontWeight: 600 }}>
                                        VALOR LÍQUIDO:
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontSize: { xs: 40, md: 34 },
                                            fontWeight: 900,
                                            color: isNetNegative ? '#ff9d9d' : colors.accent,
                                            lineHeight: 1,
                                            letterSpacing: '-0.02em',
                                        }}
                                    >
                                        {formatCurrency(payroll.netPay)}
                                    </Typography>
                                </Box>

                                <Button
                                    variant="contained"
                                    onClick={onOpenLaunchSalaryDialog}
                                    disabled={payroll.netPay <= 0}
                                    sx={{
                                        borderRadius: '10px',
                                        py: 1.15,
                                        fontSize: '13px',
                                        fontWeight: 700,
                                        bgcolor: colors.accent,
                                        color: colors.bgPrimary,
                                        '&:hover': { bgcolor: '#D4B85C' },
                                    }}
                                >
                                    Lançar Salário nas Transações
                                </Button>

                                {isTemporaryCalculation && (
                                    <Alert severity="info" sx={{ py: 0.65 }}>
                                        Cálculo temporário ativo para a vigência {formatDateBR(calculationSetting?.date_start ?? today)} ate {formatDateBR(calculationSetting?.date_end ?? '9999-12-31')}.
                                    </Alert>
                                )}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ borderRadius: '14px', height: '100%' }}>
                        <CardContent sx={{ p: { xs: 2.25, md: 2.5 } }}>
                            <Stack spacing={1.75}>
                                <Typography sx={{ fontWeight: 700, fontFamily: '"Plus Jakarta Sans"' }}>
                                    Resumo do Simulador
                                </Typography>

                                <Stack direction="row" justifyContent="space-between" sx={{ py: 0.45 }}>
                                    <Typography color="text.secondary">Vigência em cálculo</Typography>
                                    <Typography sx={{ fontWeight: 600 }}>
                                        {formatDateBR(calculationSetting?.date_start ?? today)} ate {formatDateBR(calculationSetting?.date_end ?? '9999-12-31')}
                                    </Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" sx={{ py: 0.45 }}>
                                    <Typography color="text.secondary">Valor/Hora</Typography>
                                    <Typography sx={{ fontWeight: 600 }}>{formatCurrency(currentHourlyRate)}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" sx={{ py: 0.45 }}>
                                    <Typography color="text.secondary">Pró-Labore</Typography>
                                    <Typography sx={{ fontWeight: 600 }}>{formatCurrency(currentBaseSalary)}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" sx={{ py: 0.45 }}>
                                    <Typography color="text.secondary">Remuneração Bruta</Typography>
                                    <Typography sx={{ fontWeight: 700, color: colors.green }}>
                                        {formatCurrency(payroll.grossPay)}
                                    </Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" sx={{ py: 0.45 }}>
                                    <Typography color="text.secondary">Antecipação de Sobras</Typography>
                                    <Typography sx={{ fontWeight: 700, color: colors.green }}>
                                        {formatCurrency(payroll.profitAdvance)}
                                    </Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" sx={{ py: 0.45 }}>
                                    <Typography color="text.secondary">INSS ({inssLabel})</Typography>
                                    <Typography sx={{ fontWeight: 700, color: colors.red }}>
                                        {formatCurrency(inssDisplay)}
                                    </Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" sx={{ py: 0.45 }}>
                                    <Typography color="text.secondary">Taxa Administração ({adminFeeLabel})</Typography>
                                    <Typography sx={{ fontWeight: 700, color: colors.red }}>
                                        {formatCurrency(adminDisplay)}
                                    </Typography>
                                </Stack>

                                <Stack direction="row" justifyContent="space-between" sx={{ py: 0.4, mt: 0.1 }}>
                                    <Typography sx={{ fontWeight: 700 }}>Total de Descontos</Typography>
                                    <Typography sx={{ fontWeight: 700 }}>
                                        {formatCurrency(Math.abs(payroll.totalDiscounts))}
                                    </Typography>
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Grid>
    );
}
