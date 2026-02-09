import { format } from 'date-fns';
import { useMemo, useState } from 'react';
import { useAccounts } from '@/shared/hooks/useAccounts';
import { useCategories } from '@/shared/hooks/useCategories';
import {
    useCreateSalarySetting,
    useDeleteCurrentSalarySetting,
    useSalaryCurrentSetting,
    useSalarySettingsHistory,
    useUpdateSalarySetting,
} from '@/shared/hooks/useSalarySettings';
import { useCreateTransaction } from '@/shared/hooks/useTransactions';
import type { SalarySetting } from '@/shared/interfaces';
import { calculatePayroll } from '@/shared/utils/payroll-calculations';
import {
    buildSettingKey,
    formatDateBR,
    getErrorMessage,
    type EditSettingForm,
    toNumber,
} from '@/shared/components/salary-simulator/salarySimulator.helpers';

type MessageState = { type: 'success' | 'error'; text: string } | null;
type ActiveTab = 'simulator' | 'settings';

export function useSalarySimulatorPageLogic() {
    const today = format(new Date(), 'yyyy-MM-dd');
    const { data: currentSetting, isLoading: loadingCurrent } = useSalaryCurrentSetting();
    const { data: history, isLoading: loadingHistory } = useSalarySettingsHistory();
    const { data: accounts = [] } = useAccounts();
    const { data: categories = [] } = useCategories();
    const createSetting = useCreateSalarySetting();
    const updateSetting = useUpdateSalarySetting();
    const deleteCurrentSetting = useDeleteCurrentSalarySetting();
    const createTransaction = useCreateTransaction();

    const [message, setMessage] = useState<MessageState>(null);
    const [activeTab, setActiveTab] = useState<ActiveTab>('simulator');
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
        calculationSetting
        && currentSetting
        && buildSettingKey(calculationSetting) !== buildSettingKey(currentSetting)
    );

    const currentHourlyRate = Number(calculationSetting?.hourly_rate ?? 0);
    const currentBaseSalary = Number(calculationSetting?.base_salary ?? 0);
    const currentInssPercentage = Number(calculationSetting?.inss_discount_percentage ?? 20);
    const currentAdminFeePercentage = Number(calculationSetting?.admin_fee_percentage ?? 4.5);

    const payroll = useMemo(
        () => calculatePayroll({
            totalHours: toNumber(totalHours),
            hourlyRate: currentHourlyRate,
            baseSalary: currentBaseSalary,
            inssPercentage: currentInssPercentage,
            adminFeePercentage: currentAdminFeePercentage,
        }),
        [totalHours, currentHourlyRate, currentBaseSalary, currentInssPercentage, currentAdminFeePercentage]
    );

    const inssDisplay = Math.abs(payroll.inssDiscount);
    const adminDisplay = Math.abs(payroll.adminFeeDiscount);
    const inssLabel = `${currentInssPercentage.toFixed(2).replace('.', ',')}%`;
    const adminFeeLabel = `${currentAdminFeePercentage.toFixed(2).replace('.', ',')}%`;
    const isNetNegative = payroll.netPay < 0;
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

    const handleCloseCreateDialog = () => {
        if (createSetting.isPending) return;
        setCreateDialogOpen(false);
    };

    const handleSaveSetting = async () => {
        setMessage(null);
        if (!newDateStart) {
            setMessage({ type: 'error', text: 'Informe a data de inicio da vigencia.' });
            return;
        }
        try {
            const saved = await createSetting.mutateAsync({
                date_start: newDateStart,
                hourly_rate: toNumber(newHourlyRate),
                base_salary: toNumber(newBaseSalary),
                inss_discount_percentage: toNumber(newInssPercentage),
                admin_fee_percentage: toNumber(newAdminFeePercentage),
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
            setMessage({
                type: 'success',
                text: `Vigencia atual removida. Vigencia ${formatDateBR(restored.date_start)} restaurada.`,
            });
        } catch (error) {
            setMessage({ type: 'error', text: getErrorMessage(error) });
            setDeleteDialogOpen(false);
        }
    };

    const handleOpenLaunchSalaryDialog = () => {
        setMessage(null);
        if (payroll.netPay <= 0) {
            setMessage({ type: 'error', text: 'O lançamento só é permitido quando o valor líquido for maior que zero.' });
            return;
        }
        const defaultAccount = accounts.find((account) => account.name.toLowerCase() === 'santander') ?? accounts[0];
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

    const handleConfirmLaunchSalary = async () => {
        setMessage(null);
        if (payroll.netPay <= 0) {
            setMessage({ type: 'error', text: 'O lançamento só é permitido quando o valor líquido for maior que zero.' });
            return;
        }
        if (!salaryDescription.trim() || !salaryAccountId || !salaryCategoryId || !salaryPaymentDate) {
            setMessage({ type: 'error', text: 'Preencha descrição, conta, categoria e data da transação.' });
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

    return {
        today, message, activeTab, selectedSettingInputKey, loadingCurrent, loadingHistory, currentSetting, history,
        availableSettings, calculationSetting, isTemporaryCalculation, totalHours, payroll, isNetNegative,
        currentHourlyRate, currentBaseSalary, inssLabel, adminFeeLabel, inssDisplay, adminDisplay, createDialogOpen,
        newDateStart, newHourlyRate, newBaseSalary, newInssPercentage, newAdminFeePercentage, createSetting, editForm,
        updateSetting, deleteDialogOpen, deleteCurrentSetting, launchSalaryDialogOpen, salaryDescription,
        salaryAccountId, salaryCategoryId, salaryPaymentDate, accounts, incomeCategories, createTransaction,
        setActiveTab, setSelectedSettingKey, setNewDateStart, setNewHourlyRate, setNewBaseSalary,
        setNewInssPercentage, setNewAdminFeePercentage, setEditForm, setDeleteDialogOpen, setSalaryDescription,
        setSalaryAccountId, setSalaryCategoryId, setSalaryPaymentDate, handleHoursChange, handleHoursBlur,
        handleOpenCreateDialog, handleCloseCreateDialog, handleSaveSetting, handleOpenEdit, handleCloseEdit,
        handleSaveEdit, handleConfirmDeleteCurrent, handleOpenLaunchSalaryDialog, handleCloseLaunchSalaryDialog,
        handleConfirmLaunchSalary,
    };
}
