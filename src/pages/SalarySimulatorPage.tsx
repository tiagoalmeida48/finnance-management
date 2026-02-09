import { Alert, Box, Button, Card, CircularProgress, Container, Grid, Stack, Tab, Tabs, Typography } from '@mui/material';
import { Plus } from 'lucide-react';
import { SalaryCreateSettingDialog } from '@/shared/components/salary-simulator/SalaryCreateSettingDialog';
import { SalaryDeleteDialog } from '@/shared/components/salary-simulator/SalaryDeleteDialog';
import { SalaryEditSettingDialog } from '@/shared/components/salary-simulator/SalaryEditSettingDialog';
import { SalaryLaunchDialog } from '@/shared/components/salary-simulator/SalaryLaunchDialog';
import { SalarySettingsTab } from '@/shared/components/salary-simulator/SalarySettingsTab';
import { SalarySimulatorTab } from '@/shared/components/salary-simulator/SalarySimulatorTab';
import type { EditSettingForm } from '@/shared/components/salary-simulator/salarySimulator.helpers';
import { useSalarySimulatorPageLogic } from '@/shared/hooks/useSalarySimulatorPageLogic';
import { colors } from '@/shared/theme';

export function SalarySimulatorPage() {
    const logic = useSalarySimulatorPageLogic();

    if (logic.loadingCurrent && !logic.currentSetting) {
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
                            <Typography
                                sx={{
                                    fontSize: '28px',
                                    fontFamily: '"Plus Jakarta Sans"',
                                    fontWeight: 700,
                                    color: colors.textPrimary,
                                    mb: 0.5,
                                }}
                            >
                                Simulador de Holerite
                            </Typography>
                            <Typography sx={{ fontSize: '14px', color: colors.textSecondary }}>
                                Cálculo em tempo real com vigências salariais e histórico.
                            </Typography>
                        </Box>

                        <Button
                            variant="contained"
                            startIcon={<Plus size={16} />}
                            onClick={logic.handleOpenCreateDialog}
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

                    {logic.message && <Alert severity={logic.message.type}>{logic.message.text}</Alert>}

                    {!logic.currentSetting && (
                        <Alert severity="warning">
                            Nenhuma configuracao vigente encontrada. Cadastre a primeira configuracao para habilitar o simulador.
                        </Alert>
                    )}

                    <Card sx={{ borderRadius: '14px' }}>
                        <Box sx={{ p: { xs: 2, md: 2.25 }, pb: 0 }}>
                            <Box
                                sx={{
                                    display: 'inline-flex',
                                    bgcolor: colors.bgCard,
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: '10px',
                                    p: '3px',
                                }}
                            >
                                <Tabs
                                    value={logic.activeTab}
                                    onChange={(_, value) => logic.setActiveTab(value)}
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
                            {logic.activeTab === 'simulator' && (
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
                        </Grid>
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
                </Stack>
            </Container>
        </Box>
    );
}
