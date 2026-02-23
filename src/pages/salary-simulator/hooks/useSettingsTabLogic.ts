import { useState } from 'react';
import type { SalarySetting } from '@/shared/interfaces';
import {
    useCreateSalarySetting,
    useUpdateSalarySetting,
    useDeleteCurrentSalarySetting,
} from '@/shared/hooks/api/useSalarySettings';
import { buildSettingKey, formatDateBR, getErrorMessage, type EditSettingForm, toNumber } from '@/pages/salary-simulator/components/salarySimulator.helpers';

type MessageState = { type: 'success' | 'error'; text: string } | null;

export function useSettingsTabLogic(
    setMessage: (msg: MessageState) => void,
    selectedSettingKey: string,
    setSelectedSettingKey: (key: string) => void
) {
    const createSetting = useCreateSalarySetting();
    const updateSetting = useUpdateSalarySetting();
    const deleteCurrentSetting = useDeleteCurrentSalarySetting();

    const [newDateStart, setNewDateStart] = useState('');
    const [newHourlyRate, setNewHourlyRate] = useState('');
    const [newBaseSalary, setNewBaseSalary] = useState('');
    const [newInssPercentage, setNewInssPercentage] = useState('');
    const [newAdminFeePercentage, setNewAdminFeePercentage] = useState('');

    const [editForm, setEditForm] = useState<EditSettingForm | null>(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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

    return {
        createSetting,
        updateSetting,
        deleteCurrentSetting,
        newDateStart,
        newHourlyRate,
        newBaseSalary,
        newInssPercentage,
        newAdminFeePercentage,
        editForm,
        createDialogOpen,
        deleteDialogOpen,
        setNewDateStart,
        setNewHourlyRate,
        setNewBaseSalary,
        setNewInssPercentage,
        setNewAdminFeePercentage,
        setEditForm,
        setCreateDialogOpen,
        setDeleteDialogOpen,
        handleOpenCreateDialog,
        handleCloseCreateDialog,
        handleSaveSetting,
        handleOpenEdit,
        handleCloseEdit,
        handleSaveEdit,
        handleConfirmDeleteCurrent,
    };
}
