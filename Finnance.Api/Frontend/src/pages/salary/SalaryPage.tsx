import { Receipt, TriangleAlert } from 'lucide-react';
import { Button, PageHeader, SegmentedControl, Spinner } from '@/shared/components/ui';
import {
  PayrollCalculatorTab,
  SalaryCloseDialog,
  SalaryEditSettingDialog,
  SalaryLaunchDialog,
  SalarySettingFormModal,
  SalarySettingsTab,
  SalarySimulatorPanel,
  SalarySimulatorSummary,
  useSalarySimulatorPageLogic,
} from '@/features/salary';

export function SalaryPage() {
  const logic = useSalarySimulatorPageLogic();

  if (logic.loadingCurrent && !logic.currentSetting) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Receipt}
        title="Simulador de salário"
        description="Simule sua folha, gerencie vigências e lance o salário como transação."
        actions={<Button onClick={logic.handleOpenCreateDialog}>Nova vigência</Button>}
      />

      {!logic.currentSetting && (
        <div className="flex items-center gap-2.5 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
          <TriangleAlert size={16} className="shrink-0" />
          Nenhuma vigência salarial em aberto. Cadastre uma vigência para calcular sua folha.
        </div>
      )}

      <SegmentedControl
        value={logic.activeTab}
        onChange={logic.setActiveTab}
        options={[
          { value: 'simulator', label: 'Simulador' },
          { value: 'settings', label: 'Vigências' },
        ]}
      />

      {logic.activeTab === 'simulator' ? (
        <div className="space-y-3">
          <div className="grid gap-3 lg:grid-cols-2">
            <SalarySimulatorPanel
              availableSettings={logic.availableSettings}
              currentSetting={logic.currentSetting}
              selectedSettingInputKey={logic.selectedSettingInputKey}
              onSelectedSettingChange={logic.setSelectedSettingKey}
              totalHours={logic.totalHours}
              onHoursChange={logic.handleHoursChange}
              onHoursBlur={logic.handleHoursBlur}
              payroll={logic.payroll}
              isNetNegative={logic.isNetNegative}
              calculationSetting={logic.calculationSetting}
              isTemporaryCalculation={logic.isTemporaryCalculation}
              onOpenLaunchDialog={logic.handleOpenLaunchDialog}
            />
            <PayrollCalculatorTab />
          </div>
          <SalarySimulatorSummary
            payroll={logic.payroll}
            calculationSetting={logic.calculationSetting}
            currentHourlyRate={logic.currentHourlyRate}
            currentBaseSalary={logic.currentBaseSalary}
            inssLabel={logic.inssLabel}
            adminFeeLabel={logic.adminFeeLabel}
            inssDisplay={logic.inssDisplay}
            adminDisplay={logic.adminDisplay}
          />
        </div>
      ) : (
        <SalarySettingsTab
          loadingHistory={logic.loadingHistory}
          history={logic.history}
          onOpenEdit={logic.handleOpenEdit}
          onRequestClose={logic.handleRequestClose}
          closePending={logic.closeSetting.isPending}
        />
      )}

      <SalarySettingFormModal
        open={logic.createDialogOpen}
        onOpenChange={(open) => !open && logic.handleCloseCreateDialog()}
        onSubmit={logic.handleSaveSetting}
        submitting={logic.createSetting.isPending}
      />

      <SalaryEditSettingDialog
        editForm={logic.editForm}
        isSaving={logic.updateSetting.isPending}
        onClose={logic.handleCloseEdit}
        onSave={logic.handleSaveEdit}
        onFieldChange={logic.handleFieldChange}
      />

      <SalaryCloseDialog
        open={logic.closeDialogOpen}
        isClosing={logic.closeSetting.isPending}
        onClose={logic.handleCancelClose}
        onConfirm={logic.handleConfirmClose}
      />

      <SalaryLaunchDialog
        open={logic.launchDialogOpen}
        isSaving={logic.create.isPending}
        description={logic.description}
        accountId={logic.accountId}
        categoryId={logic.categoryId}
        paymentDate={logic.paymentDate}
        netPay={logic.payroll.netPay}
        accounts={logic.accounts}
        incomeCategories={logic.incomeCategories}
        onClose={logic.handleCloseLaunchDialog}
        onConfirm={logic.handleConfirmLaunch}
        onDescriptionChange={logic.setDescription}
        onAccountChange={logic.setAccountId}
        onCategoryChange={logic.setCategoryId}
        onPaymentDateChange={logic.setPaymentDate}
      />
    </div>
  );
}
