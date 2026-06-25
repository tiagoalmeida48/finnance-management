import { useState } from 'react';
import {
  useCloseSalarySetting,
  useCreateSalarySetting,
  useDeleteCurrentSalarySetting,
  useUpdateSalarySetting,
} from './useSalary';
import { toNumber } from '../constants';
import type { EditSettingForm, SalarySetting } from '../types/salary.types';
import type { SalaryFormValues } from '../components/SalarySettingFormModal';

export function useSettingsTab() {
  const createSetting = useCreateSalarySetting();
  const updateSetting = useUpdateSalarySetting();
  const closeSetting = useCloseSalarySetting();
  const deleteSetting = useDeleteCurrentSalarySetting();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditSettingForm | null>(null);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [settingToClose, setSettingToClose] = useState<SalarySetting | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleOpenCreateDialog = () => setCreateDialogOpen(true);

  const handleCloseCreateDialog = () => {
    if (createSetting.isPending) return;
    setCreateDialogOpen(false);
  };

  const handleSaveSetting = (values: SalaryFormValues) => {
    createSetting.mutate(values, {
      onSuccess: () => setCreateDialogOpen(false),
    });
  };

  const handleOpenEdit = (setting: SalarySetting) => {
    setEditForm({
      settingsSalary: setting.settingsSalary,
      dateStart: setting.dateStart.slice(0, 10),
      dateEnd: setting.active ? '' : setting.dateEnd.slice(0, 10),
      active: setting.active,
      hourlyRate: String(setting.hourlyRate),
      baseSalary: String(setting.baseSalary),
      inssPercentage: String(setting.inssDiscountPercentage),
      adminFeePercentage: String(setting.adminFeePercentage),
    });
  };

  const handleCloseEdit = () => {
    if (updateSetting.isPending) return;
    setEditForm(null);
  };

  const handleSaveEdit = () => {
    if (!editForm) return;
    updateSetting.mutate(
      {
        settingsSalary: editForm.settingsSalary,
        dateStart: editForm.dateStart,
        dateEnd: editForm.dateEnd || '9999-12-31',
        hourlyRate: toNumber(editForm.hourlyRate),
        baseSalary: toNumber(editForm.baseSalary),
        inssDiscountPercentage: toNumber(editForm.inssPercentage),
        adminFeePercentage: toNumber(editForm.adminFeePercentage),
      },
      { onSuccess: () => setEditForm(null) },
    );
  };

  const handleFieldChange = (field: keyof EditSettingForm, value: string) => {
    setEditForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleRequestClose = (setting: SalarySetting) => {
    setSettingToClose(setting);
    setCloseDialogOpen(true);
  };

  const handleCancelClose = () => {
    if (closeSetting.isPending) return;
    setCloseDialogOpen(false);
    setSettingToClose(null);
  };

  const handleConfirmClose = () => {
    if (!settingToClose) return;
    const dateEnd = new Date().toISOString().slice(0, 10);
    closeSetting.mutate(
      { settingsSalary: settingToClose.settingsSalary, dateEnd },
      {
        onSuccess: () => {
          setCloseDialogOpen(false);
          setSettingToClose(null);
        },
      },
    );
  };

  const handleRequestDelete = () => setDeleteDialogOpen(true);

  const handleCancelDelete = () => {
    if (deleteSetting.isPending) return;
    setDeleteDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    deleteSetting.mutate(undefined, {
      onSuccess: () => setDeleteDialogOpen(false),
    });
  };

  return {
    createSetting,
    updateSetting,
    closeSetting,
    deleteSetting,
    createDialogOpen,
    editForm,
    closeDialogOpen,
    deleteDialogOpen,
    handleOpenCreateDialog,
    handleCloseCreateDialog,
    handleSaveSetting,
    handleOpenEdit,
    handleCloseEdit,
    handleSaveEdit,
    handleFieldChange,
    handleRequestClose,
    handleCancelClose,
    handleConfirmClose,
    handleRequestDelete,
    handleCancelDelete,
    handleConfirmDelete,
  };
}
