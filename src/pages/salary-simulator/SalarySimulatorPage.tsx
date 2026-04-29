import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Plus } from 'lucide-react';
import { SalaryCreateSettingDialog } from '@/pages/salary-simulator/components/dialogs/SalaryCreateSettingDialog';
import { SalaryDeleteDialog } from '@/pages/salary-simulator/components/dialogs/SalaryDeleteDialog';
import { SalaryEditSettingDialog } from '@/pages/salary-simulator/components/dialogs/SalaryEditSettingDialog';
import { SalaryLaunchDialog } from '@/pages/salary-simulator/components/dialogs/SalaryLaunchDialog';
import { SalarySettingsTab } from '@/pages/salary-simulator/components/tabs/SalarySettingsTab';
<<<<<<< HEAD
import { SalarySimulatorPanel, SalarySimulatorSummary } from '@/pages/salary-simulator/components/tabs/SalarySimulatorTab';
import { PayrollCalculatorTab } from '@/pages/salary-simulator/components/tabs/PayrollCalculatorTab';
=======
import { SalarySimulatorTab } from '@/pages/salary-simulator/components/tabs/SalarySimulatorTab';
>>>>>>> finnance-management/main
import type { EditSettingForm } from '@/pages/salary-simulator/components/salarySimulator.helpers';
import { useSalarySimulatorPageLogic } from '@/pages/salary-simulator/hooks/useSalarySimulatorPageLogic';
import { Container } from '@/shared/components/layout/Container';
import { Section } from '@/shared/components/layout/Section';
import { messages } from '@/shared/i18n/messages';
import { PageHeader } from '@/shared/components/composite/PageHeader';
import { Text } from '@/shared/components/ui/Text';

export function SalarySimulatorPage() {
  const pageMessages = messages.salarySimulator.page;
  const logic = useSalarySimulatorPageLogic();

  if (logic.loadingCurrent && !logic.currentSetting) {
    return (
      <Container unstyled className="flex justify-center py-10">
        <Text
          as="span"
          className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-primary)] border-r-transparent"
        />
      </Container>
    );
  }

  return (
    <Section>
      <Container>
        <Container unstyled className="flex flex-col gap-3">
          <PageHeader
            title={pageMessages.title}
            subtitle={pageMessages.subtitle}
            actions={
              <Button
                variant="contained"
                startIcon={<Plus size={16} />}
                onClick={logic.handleOpenCreateDialog}
              >
                {pageMessages.newValidity}
              </Button>
            }
            className="w-full flex-col items-start sm:flex-row sm:items-center"
          />

          {logic.message && (
            <Container
              unstyled
              className={`rounded border p-2 text-sm ${
                logic.message.type === 'error'
                  ? 'border-[var(--color-error)] bg-[var(--overlay-error-08)] text-[var(--color-error)]'
                  : 'border-[var(--color-primary)] bg-[var(--overlay-primary-08)] text-[var(--color-text-primary)]'
              }`}
            >
              {logic.message.text}
            </Container>
          )}

          {!logic.currentSetting && (
            <Container
              unstyled
              className="rounded border border-yellow-500/30 bg-yellow-500/10 p-2 text-sm text-yellow-100"
            >
              {pageMessages.noCurrentSetting}
            </Container>
          )}

          <Card className="rounded-[14px] p-3">
            <Container
              unstyled
              className="mb-4 inline-flex w-full items-center justify-center rounded-[12px] border border-[var(--color-border)] bg-[var(--overlay-white-03)] p-1 shadow-sm sm:w-auto"
            >
              <Button
                type="button"
                onClick={() => logic.setActiveTab('simulator')}
                className={`flex-1 rounded-[10px] px-6 py-2 text-sm transition-all duration-200 sm:flex-none ${
                  logic.activeTab === 'simulator'
                    ? 'bg-[var(--color-primary)] font-bold text-[var(--color-background)] shadow-md'
                    : 'bg-transparent font-medium text-[var(--color-text-secondary)] hover:bg-[var(--overlay-white-05)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                {pageMessages.tabSimulator}
              </Button>
              <Button
                type="button"
                onClick={() => logic.setActiveTab('settings')}
                className={`flex-1 rounded-[10px] px-6 py-2 text-sm transition-all duration-200 sm:flex-none ${
                  logic.activeTab === 'settings'
                    ? 'bg-[var(--color-primary)] font-bold text-[var(--color-background)] shadow-md'
                    : 'bg-transparent font-medium text-[var(--color-text-secondary)] hover:bg-[var(--overlay-white-05)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                {pageMessages.tabSettings}
              </Button>
            </Container>

            <Container unstyled className="grid gap-2">
              {logic.activeTab === 'simulator' && (
<<<<<<< HEAD
                <Container unstyled className="flex flex-col gap-4">
                  <Container unstyled className="grid gap-4 lg:grid-cols-2">
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
                      today={logic.today}
                      currentHourlyRate={logic.currentHourlyRate}
                      currentBaseSalary={logic.currentBaseSalary}
                      inssLabel={logic.inssLabel}
                      adminFeeLabel={logic.adminFeeLabel}
                      inssDisplay={logic.inssDisplay}
                      adminDisplay={logic.adminDisplay}
                      isTemporaryCalculation={logic.isTemporaryCalculation}
                      onOpenLaunchSalaryDialog={logic.handleOpenLaunchSalaryDialog}
                    />
                    <PayrollCalculatorTab />
                  </Container>
                  <SalarySimulatorSummary
                    payroll={logic.payroll}
                    calculationSetting={logic.calculationSetting}
                    today={logic.today}
                    currentHourlyRate={logic.currentHourlyRate}
                    currentBaseSalary={logic.currentBaseSalary}
                    inssLabel={logic.inssLabel}
                    adminFeeLabel={logic.adminFeeLabel}
                    inssDisplay={logic.inssDisplay}
                    adminDisplay={logic.adminDisplay}
                  />
                </Container>
=======
                <SalarySimulatorTab
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
                  today={logic.today}
                  currentHourlyRate={logic.currentHourlyRate}
                  currentBaseSalary={logic.currentBaseSalary}
                  inssLabel={logic.inssLabel}
                  adminFeeLabel={logic.adminFeeLabel}
                  inssDisplay={logic.inssDisplay}
                  adminDisplay={logic.adminDisplay}
                  isTemporaryCalculation={logic.isTemporaryCalculation}
                  onOpenLaunchSalaryDialog={logic.handleOpenLaunchSalaryDialog}
                />
>>>>>>> finnance-management/main
              )}

              {logic.activeTab === 'settings' && (
                <SalarySettingsTab
                  loadingHistory={logic.loadingHistory}
                  history={logic.history ?? []}
                  onOpenEdit={logic.handleOpenEdit}
                  onOpenDeleteDialog={() => logic.setDeleteDialogOpen(true)}
                  deletePending={logic.deleteCurrentSetting.isPending}
                />
              )}
            </Container>
          </Card>

          <SalaryCreateSettingDialog
            open={logic.createDialogOpen}
            isSaving={logic.createSetting.isPending}
            dateStart={logic.newDateStart}
            hourlyRate={logic.newHourlyRate}
            baseSalary={logic.newBaseSalary}
            inssPercentage={logic.newInssPercentage}
            adminFeePercentage={logic.newAdminFeePercentage}
            onClose={logic.handleCloseCreateDialog}
            onSave={logic.handleSaveSetting}
            onDateStartChange={logic.setNewDateStart}
            onHourlyRateChange={logic.setNewHourlyRate}
            onBaseSalaryChange={logic.setNewBaseSalary}
            onInssPercentageChange={logic.setNewInssPercentage}
            onAdminFeePercentageChange={logic.setNewAdminFeePercentage}
          />

          <SalaryEditSettingDialog
            editForm={logic.editForm}
            isSaving={logic.updateSetting.isPending}
            onClose={logic.handleCloseEdit}
            onSave={logic.handleSaveEdit}
            onFieldChange={(field: keyof EditSettingForm, value: string) =>
              logic.setEditForm((prev) => (prev ? { ...prev, [field]: value } : prev))
            }
          />

          <SalaryDeleteDialog
            open={logic.deleteDialogOpen}
            isDeleting={logic.deleteCurrentSetting.isPending}
            onClose={() => {
              if (!logic.deleteCurrentSetting.isPending) {
                logic.setDeleteDialogOpen(false);
              }
            }}
            onConfirm={logic.handleConfirmDeleteCurrent}
          />

          <SalaryLaunchDialog
            open={logic.launchSalaryDialogOpen}
            isSaving={logic.createTransaction.isPending}
            description={logic.salaryDescription}
            accountId={logic.salaryAccountId}
            categoryId={logic.salaryCategoryId}
            paymentDate={logic.salaryPaymentDate}
            netPay={logic.payroll.netPay}
            accounts={logic.accounts}
            incomeCategories={logic.incomeCategories}
            onClose={logic.handleCloseLaunchSalaryDialog}
            onConfirm={logic.handleConfirmLaunchSalary}
            onDescriptionChange={logic.setSalaryDescription}
            onAccountChange={logic.setSalaryAccountId}
            onCategoryChange={logic.setSalaryCategoryId}
            onPaymentDateChange={logic.setSalaryPaymentDate}
          />
        </Container>
      </Container>
    </Section>
  );
}
