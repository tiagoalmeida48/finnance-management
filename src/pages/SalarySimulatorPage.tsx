import { useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    MenuItem,
    Stack,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    TextField,
    Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR as pickersPtBR } from '@mui/x-date-pickers/locales';
import { Clock3, History, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { colors } from '@/shared/theme';
import {
    useCreateSalarySetting,
    useDeleteCurrentSalarySetting,
    useSalaryCurrentSetting,
    useSalarySettingsHistory,
    useUpdateSalarySetting
} from '@/shared/hooks/useSalarySettings';
import { useAccounts } from '@/shared/hooks/useAccounts';
import { useCategories } from '@/shared/hooks/useCategories';
import { useCreateTransaction } from '@/shared/hooks/useTransactions';
import { SalarySetting } from '@/shared/interfaces';
import { calculatePayroll } from '@/shared/utils/payroll-calculations';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
}).format(value);

const toNumber = (value: string) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

const formatDateBR = (value: string) => {
    if (value === '9999-12-31') return 'Vigente';
    return new Date(`${value}T00:00:00`).toLocaleDateString('pt-BR');
};

const getErrorMessage = (error: unknown) => {
    if (typeof error === 'object' && error && 'message' in error) {
        const message = (error as { message?: string }).message;
        if (message) return message;
    }
    return 'Nao foi possivel salvar a configuracao.';
};

const buildSettingKey = (setting: Pick<SalarySetting, 'date_start' | 'date_end'>) =>
    `${setting.date_start}|${setting.date_end}`;

interface EditSettingForm {
    originalDateStart: string;
    originalDateEnd: string;
    dateStart: string;
    dateEnd: string;
    hourlyRate: string;
    baseSalary: string;
    inssPercentage: string;
    adminFeePercentage: string;
}

export function SalarySimulatorPage() {
    const today = format(new Date(), 'yyyy-MM-dd');
    const { data: currentSetting, isLoading: loadingCurrent } = useSalaryCurrentSetting();
    const { data: history, isLoading: loadingHistory } = useSalarySettingsHistory();
    const { data: accounts = [] } = useAccounts();
    const { data: categories = [] } = useCategories();
    const createSetting = useCreateSalarySetting();
    const updateSetting = useUpdateSalarySetting();
    const deleteCurrentSetting = useDeleteCurrentSalarySetting();
    const createTransaction = useCreateTransaction();

    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [activeTab, setActiveTab] = useState<'simulator' | 'settings'>('simulator');
    const [selectedSettingKey, setSelectedSettingKey] = useState('');

    const [totalHours, setTotalHours] = useState('0');

    const [newDateStart, setNewDateStart] = useState('');
    const [newHourlyRate, setNewHourlyRate] = useState('');
    const [newBaseSalary, setNewBaseSalary] = useState('');
    const [newInssPercentage, setNewInssPercentage] = useState('');
    const [newAdminFeePercentage, setNewAdminFeePercentage] = useState('');
    const [editForm, setEditForm] = useState<EditSettingForm | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [launchSalaryDialogOpen, setLaunchSalaryDialogOpen] = useState(false);
    const [salaryDescription, setSalaryDescription] = useState('PIX RECEBIDO COOP SOMA');
    const [salaryAccountId, setSalaryAccountId] = useState('');
    const [salaryCategoryId, setSalaryCategoryId] = useState('');
    const [salaryPaymentDate, setSalaryPaymentDate] = useState('');

    const availableSettings = useMemo(() => {
        const allSettings = history ?? [];
        if (allSettings.length > 0) return allSettings;
        return currentSetting ? [currentSetting] : [];
    }, [history, currentSetting]);

    const currentSettingKey = currentSetting ? buildSettingKey(currentSetting) : '';
    const selectedSettingInputKey = selectedSettingKey
        || currentSettingKey
        || (availableSettings[0] ? buildSettingKey(availableSettings[0]) : '');

    const selectedSetting = useMemo(() => {
        if (availableSettings.length === 0) return currentSetting ?? null;
        return availableSettings.find((setting) => buildSettingKey(setting) === selectedSettingInputKey)
            ?? currentSetting
            ?? availableSettings[0];
    }, [availableSettings, currentSetting, selectedSettingInputKey]);

    const calculationSetting = selectedSetting ?? currentSetting ?? null;
    const isTemporaryCalculation = Boolean(
        calculationSetting &&
        currentSetting &&
        buildSettingKey(calculationSetting) !== buildSettingKey(currentSetting)
    );

    const currentHourlyRate = Number(calculationSetting?.hourly_rate ?? 0);
    const currentBaseSalary = Number(calculationSetting?.base_salary ?? 0);
    const currentInssPercentage = Number(calculationSetting?.inss_discount_percentage ?? 20);
    const currentAdminFeePercentage = Number(calculationSetting?.admin_fee_percentage ?? 4.5);

    const resolvedNewDateStart = newDateStart;
    const resolvedNewHourlyRate = newHourlyRate;
    const resolvedNewBaseSalary = newBaseSalary;
    const resolvedNewInssPercentage = newInssPercentage;
    const resolvedNewAdminFeePercentage = newAdminFeePercentage;

    const payroll = useMemo(() => calculatePayroll({
        totalHours: toNumber(totalHours),
        hourlyRate: currentHourlyRate,
        baseSalary: currentBaseSalary,
        inssPercentage: currentInssPercentage,
        adminFeePercentage: currentAdminFeePercentage,
    }), [totalHours, currentHourlyRate, currentBaseSalary, currentInssPercentage, currentAdminFeePercentage]);

    const inssDisplay = Math.abs(payroll.inssDiscount);
    const adminDisplay = Math.abs(payroll.adminFeeDiscount);

    const inssLabel = `${currentInssPercentage.toFixed(2).replace('.', ',')}%`;
    const adminFeeLabel = `${currentAdminFeePercentage.toFixed(2).replace('.', ',')}%`;
    const isNetNegative = payroll.netPay < 0;
    const blockedInputSx = {
        '& .MuiOutlinedInput-root': {
            bgcolor: 'transparent',
            borderRadius: '10px 10px 0 0',
            borderBottom: `1px solid ${colors.border}`,
            alignItems: 'flex-end',
            '& fieldset': { border: 'none' },
            '&:hover fieldset': { border: 'none' },
            '&.Mui-focused fieldset': { border: 'none' },
            '&.Mui-disabled fieldset': { border: 'none' },
        },
        '& .MuiInputBase-input': {
            paddingTop: '8px',
            paddingBottom: '4px',
        },
        '& .MuiInputBase-input.Mui-disabled': {
            WebkitTextFillColor: colors.textSecondary,
            fontWeight: 600,
        },
        '& .MuiInputLabel-root.Mui-disabled': {
            color: colors.textMuted,
        },
    };
    const modernDateInputSx = {
        '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.015) 100%)',
            '& fieldset': { borderColor: 'rgba(255,255,255,0.14)' },
            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.24)' },
            '&.Mui-focused fieldset': { borderColor: colors.accent },
        },
        '& .MuiSvgIcon-root': {
            color: colors.accent,
        },
        '& .MuiIconButton-root:hover': {
            backgroundColor: 'rgba(201, 168, 76, 0.14)',
        },
    };
    const incomeCategories = useMemo(
        () => categories.filter((category) => category.type === 'income'),
        [categories]
    );

    const handleHoursChange = (value: string) => {
        const normalizedValue = value.replace(',', '.');
        const valueWithoutLeadingZeros = normalizedValue.startsWith('0.')
            ? normalizedValue
            : normalizedValue.replace(/^0+(?=\d)/, '');

        if (valueWithoutLeadingZeros === '' || /^\d+(\.\d{0,1})?$/.test(valueWithoutLeadingZeros)) {
            setTotalHours(valueWithoutLeadingZeros);
        }
    };

    const handleHoursBlur = () => {
        const normalizedHours = Math.max(0, Number(totalHours) || 0);
        setTotalHours(normalizedHours.toFixed(1));
    };

    const handleOpenCreateDialog = () => {
        setNewDateStart('');
        setNewHourlyRate('');
        setNewBaseSalary('');
        setNewInssPercentage('');
        setNewAdminFeePercentage('');
        setCreateDialogOpen(true);
    };

    const handleOpenLaunchSalaryDialog = () => {
        setMessage(null);

        if (payroll.netPay <= 0) {
            setMessage({ type: 'error', text: 'O lançamento só é permitido quando o valor líquido for maior que zero.' });
            return;
        }

        const defaultAccount = accounts.find((account) => account.name.toLowerCase() === 'santander')
            ?? accounts[0];
        const defaultCategory = incomeCategories.find((category) => category.name.toLowerCase() === 'salário trijay')
            ?? incomeCategories.find((category) => category.name.toLowerCase() === 'salario trijay')
            ?? incomeCategories[0];
        const now = new Date();
        const paymentDate = format(new Date(now.getFullYear(), now.getMonth(), 12), 'yyyy-MM-dd');

        setSalaryDescription('PIX RECEBIDO COOP SOMA');
        setSalaryAccountId(defaultAccount?.id ?? '');
        setSalaryCategoryId(defaultCategory?.id ?? '');
        setSalaryPaymentDate(paymentDate);
        setLaunchSalaryDialogOpen(true);
    };

    const handleCloseLaunchSalaryDialog = () => {
        if (createTransaction.isPending) return;
        setLaunchSalaryDialogOpen(false);
    };

    const handleCloseCreateDialog = () => {
        if (createSetting.isPending) return;
        setCreateDialogOpen(false);
    };

    const handleSaveSetting = async () => {
        setMessage(null);

        if (!resolvedNewDateStart) {
            setMessage({ type: 'error', text: 'Informe a data de inicio da vigencia.' });
            return;
        }

        try {
            const saved = await createSetting.mutateAsync({
                date_start: resolvedNewDateStart,
                hourly_rate: toNumber(resolvedNewHourlyRate),
                base_salary: toNumber(resolvedNewBaseSalary),
                inss_discount_percentage: toNumber(resolvedNewInssPercentage),
                admin_fee_percentage: toNumber(resolvedNewAdminFeePercentage),
            });

            setNewDateStart(saved.date_start);
            setCreateDialogOpen(false);
            setMessage({ type: 'success', text: 'Configuracao salva com nova vigencia.' });
        } catch (error) {
            setMessage({ type: 'error', text: getErrorMessage(error) });
        }
    };

    const handleOpenEdit = (setting: SalarySetting) => {
        setEditForm({
            originalDateStart: setting.date_start,
            originalDateEnd: setting.date_end,
            dateStart: setting.date_start,
            dateEnd: setting.date_end,
            hourlyRate: String(setting.hourly_rate),
            baseSalary: String(setting.base_salary),
            inssPercentage: String(setting.inss_discount_percentage),
            adminFeePercentage: String(setting.admin_fee_percentage),
        });
    };

    const handleCloseEdit = () => {
        if (updateSetting.isPending) return;
        setEditForm(null);
    };

    const handleSaveEdit = async () => {
        if (!editForm) return;
        setMessage(null);

        const previousKey = `${editForm.originalDateStart}|${editForm.originalDateEnd}`;

        try {
            const updated = await updateSetting.mutateAsync({
                original_date_start: editForm.originalDateStart,
                original_date_end: editForm.originalDateEnd,
                date_start: editForm.dateStart,
                date_end: editForm.dateEnd,
                hourly_rate: toNumber(editForm.hourlyRate),
                base_salary: toNumber(editForm.baseSalary),
                inss_discount_percentage: toNumber(editForm.inssPercentage),
                admin_fee_percentage: toNumber(editForm.adminFeePercentage),
            });

            if (selectedSettingKey === previousKey) {
                setSelectedSettingKey(buildSettingKey(updated));
            }

            setEditForm(null);
            setMessage({ type: 'success', text: 'Vigencia atualizada com sucesso.' });
        } catch (error) {
            setMessage({ type: 'error', text: getErrorMessage(error) });
        }
    };

    const handleConfirmDeleteCurrent = async () => {
        setMessage(null);

        try {
            const restored = await deleteCurrentSetting.mutateAsync();
            setSelectedSettingKey('');
            setNewDateStart(restored.date_start);
            setDeleteDialogOpen(false);
            setMessage({ type: 'success', text: `Vigencia atual removida. Vigencia ${formatDateBR(restored.date_start)} restaurada.` });
        } catch (error) {
            setMessage({ type: 'error', text: getErrorMessage(error) });
            setDeleteDialogOpen(false);
        }
    };

    const handleConfirmLaunchSalary = async () => {
        setMessage(null);

        if (payroll.netPay <= 0) {
            setMessage({ type: 'error', text: 'O lançamento só é permitido quando o valor líquido for maior que zero.' });
            return;
        }
        if (!salaryDescription.trim()) {
            setMessage({ type: 'error', text: 'Informe a descrição da transação.' });
            return;
        }
        if (!salaryAccountId) {
            setMessage({ type: 'error', text: 'Selecione a conta da transação.' });
            return;
        }
        if (!salaryCategoryId) {
            setMessage({ type: 'error', text: 'Selecione a categoria da transação.' });
            return;
        }
        if (!salaryPaymentDate) {
            setMessage({ type: 'error', text: 'Informe a data da transação.' });
            return;
        }

        try {
            await createTransaction.mutateAsync({
                type: 'income',
                amount: Number(payroll.netPay.toFixed(2)),
                description: salaryDescription.trim(),
                payment_date: salaryPaymentDate,
                account_id: salaryAccountId,
                category_id: salaryCategoryId,
                payment_method: 'debit',
                is_fixed: false,
                is_paid: false,
            });

            setLaunchSalaryDialogOpen(false);
            setMessage({ type: 'success', text: 'Transação de salário lançada como pendente.' });
        } catch (error) {
            setMessage({ type: 'error', text: getErrorMessage(error) });
        }
    };

    if (loadingCurrent && !currentSetting) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    return (
        <Box sx={{ pt: 4, pb: 6 }}>
            <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
                <Stack spacing={3}>
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        spacing={{ xs: 1.5, sm: 0 }}
                    >
                        <Box>
                            <Typography sx={{
                                fontSize: '28px',
                                fontFamily: '"Plus Jakarta Sans"',
                                fontWeight: 700,
                                color: colors.textPrimary,
                                mb: 0.5,
                            }}>
                                Simulador de Holerite
                            </Typography>
                            <Typography sx={{ fontSize: '14px', color: colors.textSecondary }}>
                                Cálculo em tempo real com vigências salariais e histórico.
                            </Typography>
                        </Box>

                        <Button
                            variant="contained"
                            startIcon={<Plus size={16} />}
                            onClick={handleOpenCreateDialog}
                            sx={{
                                borderRadius: '10px',
                                px: 2.5,
                                py: 1.25,
                                fontSize: '13px',
                                fontWeight: 600,
                                bgcolor: colors.accent,
                                color: colors.bgPrimary,
                                boxShadow: '0 2px 8px rgba(201, 168, 76, 0.25)',
                                '&:hover': {
                                    bgcolor: '#D4B85C',
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 4px 16px rgba(201, 168, 76, 0.3)',
                                },
                            }}
                        >
                            Nova Vigência
                        </Button>
                    </Stack>

                    {message && <Alert severity={message.type}>{message.text}</Alert>}

                    {!currentSetting && (
                        <Alert severity="warning">
                            Nenhuma configuracao vigente encontrada. Cadastre a primeira configuracao para habilitar o simulador.
                        </Alert>
                    )}

                    <Card sx={{ borderRadius: '14px' }}>
                        <Box sx={{ p: { xs: 2, md: 2.25 }, pb: 0 }}>
                            <Box sx={{
                                display: 'inline-flex',
                                bgcolor: colors.bgCard,
                                border: `1px solid ${colors.border}`,
                                borderRadius: '10px',
                                p: '3px',
                            }}>
                                <Tabs
                                    value={activeTab}
                                    onChange={(_, value) => setActiveTab(value)}
                                    aria-label="Abas do simulador de holerite"
                                    sx={{
                                        minHeight: 0,
                                        '& .MuiTabs-indicator': { display: 'none' },
                                        '& .MuiTabs-flexContainer': { gap: 0.5 },
                                        '& .MuiTab-root': {
                                            minHeight: 32,
                                            minWidth: 120,
                                            px: 2,
                                            py: 0.75,
                                            borderRadius: '8px',
                                            textTransform: 'none',
                                            fontSize: '13px',
                                            fontFamily: '"DM Sans"',
                                            fontWeight: 500,
                                            color: colors.textSecondary,
                                        },
                                        '& .MuiTab-root.Mui-selected': {
                                            backgroundColor: colors.accent,
                                            color: colors.bgPrimary,
                                            fontWeight: 600,
                                        },
                                    }}
                                >
                                    <Tab value="simulator" label="Simulador" />
                                    <Tab value="settings" label="Configuração" />
                                </Tabs>
                            </Box>
                        </Box>

                        <Grid container spacing={2.25} sx={{ p: { xs: 2.25, md: 3 } }}>
                            {activeTab === 'simulator' && (
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
                                                                onChange={(event) => setSelectedSettingKey(event.target.value)}
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
                                                                onChange={(e) => handleHoursChange(e.target.value)}
                                                                onFocus={(event) => event.target.select()}
                                                                onBlur={handleHoursBlur}
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
                                                            onClick={handleOpenLaunchSalaryDialog}
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

                                                        <Divider sx={{ my: 0.9 }} />

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
                            )}

                            {activeTab === 'settings' && (
                                <>
                                    <Grid size={{ xs: 12 }}>
                                        <Card sx={{ borderRadius: '14px' }}>
                                            <CardContent sx={{ p: { xs: 2.25, md: 3 } }}>
                                                <Stack spacing={1.8}>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <History size={18} color={colors.accent} />
                                                        <Typography sx={{ fontWeight: 700, fontFamily: '"Plus Jakarta Sans"' }}>
                                                            Histórico de Configurações
                                                        </Typography>
                                                    </Stack>

                                                    {loadingHistory ? (
                                                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                                            <CircularProgress size={24} color="primary" />
                                                        </Box>
                                                    ) : (
                                                        <TableContainer sx={{ borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                                                            <Table size="small">
                                                                <TableHead>
                                                                    <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                                                                        <TableCell sx={{ py: 1.5, fontSize: '11px', fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Vigencia</TableCell>
                                                                        <TableCell align="right" sx={{ py: 1.5, fontSize: '11px', fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Valor/Hora</TableCell>
                                                                        <TableCell align="right" sx={{ py: 1.5, fontSize: '11px', fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pro-Labore</TableCell>
                                                                        <TableCell align="right" sx={{ py: 1.5, fontSize: '11px', fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>INSS %</TableCell>
                                                                        <TableCell align="right" sx={{ py: 1.5, fontSize: '11px', fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Taxa Adm %</TableCell>
                                                                        <TableCell align="center" sx={{ py: 1.5, fontSize: '11px', fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</TableCell>
                                                                        <TableCell align="center" sx={{ py: 1.5, fontSize: '11px', fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Acoes</TableCell>
                                                                    </TableRow>
                                                                </TableHead>
                                                                <TableBody>
                                                                    {(history ?? []).map((setting) => {
                                                                        const isCurrent = setting.date_end === '9999-12-31';

                                                                        return (
                                                                            <TableRow
                                                                                key={`${setting.user_id}-${setting.date_start}-${setting.date_end}`}
                                                                                sx={{
                                                                                    bgcolor: isCurrent ? 'rgba(201, 168, 76, 0.08)' : 'transparent',
                                                                                    '&:hover': {
                                                                                        bgcolor: isCurrent ? 'rgba(201, 168, 76, 0.12)' : 'rgba(255,255,255,0.02)',
                                                                                    },
                                                                                }}
                                                                            >
                                                                                <TableCell sx={{ color: colors.textPrimary, fontSize: '13px', py: 1.5 }}>
                                                                                    {formatDateBR(setting.date_start)} ate {formatDateBR(setting.date_end)}
                                                                                </TableCell>
                                                                                <TableCell align="right" sx={{ color: colors.textSecondary, fontSize: '13px', py: 1.5 }}>{formatCurrency(Number(setting.hourly_rate))}</TableCell>
                                                                                <TableCell align="right" sx={{ color: colors.textSecondary, fontSize: '13px', py: 1.5 }}>{formatCurrency(Number(setting.base_salary))}</TableCell>
                                                                                <TableCell align="right" sx={{ color: colors.textSecondary, fontSize: '13px', py: 1.5 }}>{Number(setting.inss_discount_percentage).toFixed(2)}</TableCell>
                                                                                <TableCell align="right" sx={{ color: colors.textSecondary, fontSize: '13px', py: 1.5 }}>{Number(setting.admin_fee_percentage).toFixed(2)}</TableCell>
                                                                                <TableCell align="center" sx={{ py: 1.5 }}>
                                                                                    {isCurrent ? <Chip size="small" color="primary" label="Vigente" /> : '-'}
                                                                                </TableCell>
                                                                                <TableCell align="center" sx={{ py: 1.5 }}>
                                                                                    <Stack direction="row" spacing={0.75} justifyContent="center">
                                                                                        <Button
                                                                                            size="small"
                                                                                            variant="text"
                                                                                            onClick={() => handleOpenEdit(setting)}
                                                                                            sx={{ fontSize: '12px', minWidth: 0, px: 1 }}
                                                                                        >
                                                                                            Editar
                                                                                        </Button>
                                                                                        {isCurrent && (
                                                                                            <Button
                                                                                                size="small"
                                                                                                color="error"
                                                                                                variant="outlined"
                                                                                                onClick={() => setDeleteDialogOpen(true)}
                                                                                                disabled={deleteCurrentSetting.isPending}
                                                                                                sx={{ fontSize: '12px', minWidth: 0, px: 1 }}
                                                                                            >
                                                                                                Excluir
                                                                                            </Button>
                                                                                        )}
                                                                                    </Stack>
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        );
                                                                    })}
                                                                </TableBody>
                                                            </Table>
                                                        </TableContainer>
                                                    )}
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </>
                            )}
                        </Grid>
                    </Card>

                    <Dialog
                        open={createDialogOpen}
                        onClose={handleCloseCreateDialog}
                        fullWidth
                        maxWidth="md"
                    >
                        <DialogTitle>Nova Configuração</DialogTitle>
                        <DialogContent sx={{ pt: 2 }}>
                            <Grid container spacing={1.5}>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Stack spacing={0.6}>
                                        <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                            Inicio da Vigencia
                                        </Typography>
                                        <TextField
                                            type="date"
                                            fullWidth
                                            value={resolvedNewDateStart}
                                            onChange={(e) => setNewDateStart(e.target.value)}
                                        />
                                    </Stack>
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Stack spacing={0.6}>
                                        <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                            Valor/Hora
                                        </Typography>
                                        <TextField
                                            type="number"
                                            fullWidth
                                            value={resolvedNewHourlyRate}
                                            onChange={(e) => setNewHourlyRate(e.target.value)}
                                            slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                                        />
                                    </Stack>
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Stack spacing={0.6}>
                                        <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                            Salário mínimo
                                        </Typography>
                                        <TextField
                                            type="number"
                                            fullWidth
                                            value={resolvedNewBaseSalary}
                                            onChange={(e) => setNewBaseSalary(e.target.value)}
                                            slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                                        />
                                    </Stack>
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Stack spacing={0.6}>
                                        <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                            INSS (%)
                                        </Typography>
                                        <TextField
                                            type="number"
                                            fullWidth
                                            value={resolvedNewInssPercentage}
                                            onChange={(e) => setNewInssPercentage(e.target.value)}
                                            slotProps={{ htmlInput: { min: 0, max: 100, step: '0.01' } }}
                                        />
                                    </Stack>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Stack spacing={0.6}>
                                        <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                            Taxa Adm (%)
                                        </Typography>
                                        <TextField
                                            type="number"
                                            fullWidth
                                            value={resolvedNewAdminFeePercentage}
                                            onChange={(e) => setNewAdminFeePercentage(e.target.value)}
                                            slotProps={{ htmlInput: { min: 0, max: 100, step: '0.01' } }}
                                        />
                                    </Stack>
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                    <Stack
                                        direction={{ xs: 'column-reverse', sm: 'row' }}
                                        spacing={1}
                                        justifyContent="flex-end"
                                    >
                                        <Button
                                            variant="text"
                                            onClick={handleCloseCreateDialog}
                                            disabled={createSetting.isPending}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            variant="contained"
                                            onClick={handleSaveSetting}
                                            disabled={createSetting.isPending}
                                        >
                                            {createSetting.isPending ? 'Salvando...' : 'Salvar Nova Vigência'}
                                        </Button>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </DialogContent>
                    </Dialog>

                    <Dialog
                        open={Boolean(editForm)}
                        onClose={handleCloseEdit}
                        fullWidth
                        maxWidth="sm"
                    >
                        <DialogTitle>Editar Vigencia</DialogTitle>
                        <DialogContent>
                            <Stack spacing={1.5} sx={{ mt: 0.5 }}>
                                <Grid container spacing={1.5}>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            label="Inicio da Vigencia"
                                            type="date"
                                            fullWidth
                                            value={editForm?.dateStart ?? ''}
                                            onChange={(event) =>
                                                setEditForm((prev) => (prev ? { ...prev, dateStart: event.target.value } : prev))
                                            }
                                            slotProps={{ inputLabel: { shrink: true } }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            label="Fim da Vigencia"
                                            type="date"
                                            fullWidth
                                            value={editForm?.dateEnd ?? ''}
                                            onChange={(event) =>
                                                setEditForm((prev) => (prev ? { ...prev, dateEnd: event.target.value } : prev))
                                            }
                                            slotProps={{ inputLabel: { shrink: true } }}
                                        />
                                    </Grid>
                                </Grid>

                                <TextField
                                    label="Valor/Hora"
                                    type="number"
                                    fullWidth
                                    value={editForm?.hourlyRate ?? ''}
                                    onChange={(event) =>
                                        setEditForm((prev) => (prev ? { ...prev, hourlyRate: event.target.value } : prev))
                                    }
                                    slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                                />

                                <TextField
                                    label="Pro-Labore"
                                    type="number"
                                    fullWidth
                                    value={editForm?.baseSalary ?? ''}
                                    onChange={(event) =>
                                        setEditForm((prev) => (prev ? { ...prev, baseSalary: event.target.value } : prev))
                                    }
                                    slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                                />

                                <Grid container spacing={1.5}>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            label="INSS (%)"
                                            type="number"
                                            fullWidth
                                            value={editForm?.inssPercentage ?? ''}
                                            onChange={(event) =>
                                                setEditForm((prev) => (prev ? { ...prev, inssPercentage: event.target.value } : prev))
                                            }
                                            slotProps={{ htmlInput: { min: 0, max: 100, step: '0.01' } }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            label="Taxa Adm (%)"
                                            type="number"
                                            fullWidth
                                            value={editForm?.adminFeePercentage ?? ''}
                                            onChange={(event) =>
                                                setEditForm((prev) => (prev ? { ...prev, adminFeePercentage: event.target.value } : prev))
                                            }
                                            slotProps={{ htmlInput: { min: 0, max: 100, step: '0.01' } }}
                                        />
                                    </Grid>
                                </Grid>
                            </Stack>
                        </DialogContent>
                        <DialogActions sx={{ px: 3, pb: 2 }}>
                            <Button onClick={handleCloseEdit} disabled={updateSetting.isPending}>
                                Cancelar
                            </Button>
                            <Button variant="contained" onClick={handleSaveEdit} disabled={updateSetting.isPending}>
                                {updateSetting.isPending ? 'Salvando...' : 'Salvar'}
                            </Button>
                        </DialogActions>
                    </Dialog>

                    <Dialog
                        open={deleteDialogOpen}
                        onClose={() => !deleteCurrentSetting.isPending && setDeleteDialogOpen(false)}
                        fullWidth
                        maxWidth="xs"
                    >
                        <DialogTitle>Excluir Vigencia Atual</DialogTitle>
                        <DialogContent>
                            <Typography color="text.secondary">
                                Isso vai remover a vigencia atual e reativar a vigencia imediatamente anterior. Deseja continuar?
                            </Typography>
                        </DialogContent>
                        <DialogActions sx={{ px: 3, pb: 2 }}>
                            <Button
                                onClick={() => setDeleteDialogOpen(false)}
                                disabled={deleteCurrentSetting.isPending}
                            >
                                Cancelar
                            </Button>
                            <Button
                                color="error"
                                variant="contained"
                                onClick={handleConfirmDeleteCurrent}
                                disabled={deleteCurrentSetting.isPending}
                            >
                                {deleteCurrentSetting.isPending ? 'Excluindo...' : 'Excluir'}
                            </Button>
                        </DialogActions>
                    </Dialog>

                    <Dialog
                        open={launchSalaryDialogOpen}
                        onClose={handleCloseLaunchSalaryDialog}
                        fullWidth
                        maxWidth="sm"
                    >
                        <DialogTitle>Detalhes da Transação de Salário</DialogTitle>
                        <DialogContent sx={{ pt: 2 }}>
                            <Stack spacing={1.5} sx={{ mt: 0.5 }}>
                                <Stack spacing={0.6}>
                                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                        Descrição
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        value={salaryDescription}
                                        onChange={(event) => setSalaryDescription(event.target.value)}
                                    />
                                </Stack>

                                <Grid container spacing={1.5}>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            select
                                            fullWidth
                                            label="Conta"
                                            value={salaryAccountId}
                                            onChange={(event) => setSalaryAccountId(event.target.value)}
                                        >
                                            {accounts.map((account) => (
                                                <MenuItem key={account.id} value={account.id}>
                                                    {account.name}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <LocalizationProvider
                                            dateAdapter={AdapterDateFns}
                                            adapterLocale={ptBR}
                                            localeText={pickersPtBR.components.MuiLocalizationProvider.defaultProps.localeText}
                                        >
                                            <DatePicker
                                                label="Data"
                                                value={salaryPaymentDate ? new Date(`${salaryPaymentDate}T00:00:00`) : null}
                                                onChange={(newValue) => {
                                                    if (!newValue || Number.isNaN(newValue.getTime())) {
                                                        setSalaryPaymentDate('');
                                                        return;
                                                    }
                                                    setSalaryPaymentDate(format(newValue, 'yyyy-MM-dd'));
                                                }}
                                                slotProps={{
                                                    textField: {
                                                        fullWidth: true,
                                                        sx: modernDateInputSx,
                                                    },
                                                    popper: {
                                                        sx: {
                                                            '& .MuiPaper-root': {
                                                                borderRadius: '14px',
                                                                border: `1px solid ${colors.border}`,
                                                                backgroundColor: colors.bgCard,
                                                            },
                                                            '& .MuiPickersLayout-actionBar': {
                                                                display: 'none',
                                                            },
                                                            '& .MuiPickersLayout-contentWrapper': {
                                                                marginBottom: 0,
                                                            },
                                                            '& .MuiPickersLayout-root': {
                                                                minHeight: 'auto',
                                                            },
                                                        },
                                                    },
                                                }}
                                            />
                                        </LocalizationProvider>
                                    </Grid>
                                </Grid>

                                <Grid container spacing={1.5}>
                                    <Grid size={{ xs: 12, md: 6 }} sx={{ mt: 2 }}>
                                        <TextField
                                            label="Tipo"
                                            fullWidth
                                            value="Receita"
                                            disabled
                                            slotProps={{ inputLabel: { shrink: true } }}
                                            sx={blockedInputSx}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }} sx={{ mt: 2 }}>
                                        <TextField
                                            label="Forma de Pagamento"
                                            fullWidth
                                            value="Débito"
                                            disabled
                                            slotProps={{ inputLabel: { shrink: true } }}
                                            sx={blockedInputSx}
                                        />
                                    </Grid>
                                </Grid>
                                <Grid container spacing={1.5}>
                                <Grid size={{ xs: 12, md: 6 }} sx={{ mt: 2 }}>
                                    <TextField
                                        select
                                        label="Categoria"
                                        value={salaryCategoryId}
                                        fullWidth
                                        onChange={(event) => setSalaryCategoryId(event.target.value)}
                                        disabled
                                        sx={{
                                            ...blockedInputSx,
                                            '& .MuiSelect-icon': {
                                                display: 'none',
                                            },
                                        }}
                                    >
                                        {incomeCategories.map((category) => (
                                            <MenuItem key={category.id} value={category.id}>
                                                {category.name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }} sx={{ mt: 2 }}>
                                    <TextField
                                        label="Valor"
                                        value={formatCurrency(payroll.netPay)}
                                        disabled
                                        fullWidth
                                        slotProps={{ inputLabel: { shrink: true } }}
                                        sx={blockedInputSx}
                                    />
                                </Grid>
                            </Grid>
                            </Stack>
                        </DialogContent>
                        <DialogActions sx={{ px: 3, pb: 2 }}>
                            <Button onClick={handleCloseLaunchSalaryDialog} disabled={createTransaction.isPending}>
                                Cancelar
                            </Button>
                            <Button variant="contained" onClick={handleConfirmLaunchSalary} disabled={createTransaction.isPending}>
                                {createTransaction.isPending ? 'Salvando...' : 'Continuar'}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Stack>
            </Container>
        </Box>
    );
}
