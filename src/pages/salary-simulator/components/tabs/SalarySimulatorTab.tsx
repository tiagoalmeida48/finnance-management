import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Select } from "@/shared/components/ui/select";
import { Input } from "@/shared/components/ui/input";
import { Clock3 } from "lucide-react";
import type { SalarySetting } from "@/shared/interfaces";
import { calculatePayroll } from "@/shared/utils/payroll-calculations";
import { colors } from "@/shared/theme";
import { salarySimulatorService } from "@/shared/services/salary-simulator.service";
import { messages } from "@/shared/i18n/messages";
import { Container } from "@/shared/components/layout/Container";
import { Text } from "@/shared/components/ui/Text";

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
  const tabMessages = messages.salarySimulator.simulatorTab;
  return (
    <Container unstyled className="col-span-12 grid gap-2 md:grid-cols-2">
      <Card className="h-full rounded-[14px]">
        <CardContent className="p-3">
          <Container unstyled className="flex flex-col gap-2">
            <Container unstyled className="flex items-center gap-2">
              <Clock3 size={18} color={colors.accent} />
              <Text className="font-heading font-bold">
                {tabMessages.title}
              </Text>
            </Container>

            <Container unstyled className="flex flex-col gap-2">
              <Container unstyled>
                <label className="mb-1 block text-xs text-[var(--color-text-secondary)]">
                  {tabMessages.selectedValidityLabel}
                </label>
                <Select
                  value={selectedSettingInputKey}
                  onChange={(event) =>
                    onSelectedSettingChange(event.target.value)
                  }
                >
                  {availableSettings.map((setting) => {
                    const key = salarySimulatorService.buildSettingKey(setting);
                    const isCurrent = currentSetting
                      ? key ===
                        salarySimulatorService.buildSettingKey(currentSetting)
                      : false;
                    return (
                      <option key={`setting-${key}`} value={key}>
                        {salarySimulatorService.formatDateBR(
                          setting.date_start,
                        )}{" "}
                        ate{" "}
                        {salarySimulatorService.formatDateBR(setting.date_end)}
                        {isCurrent ? tabMessages.currentSuffix : ""}
                      </option>
                    );
                  })}
                </Select>
              </Container>

              <Container unstyled>
                <label className="mb-1 block text-xs text-[var(--color-text-secondary)]">
                  {tabMessages.totalHoursLabel}
                </label>
                <Input
                  type="number"
                  value={totalHours}
                  onChange={(event) =>
                    event.target.value.length <= 5 &&
                    onHoursChange(event.target.value)
                  }
                  onFocus={(event) => event.target.select()}
                  onBlur={onHoursBlur}
                  min={0}
                  step={0.1}
                />
              </Container>
            </Container>

            <Container
              unstyled
              className="relative flex flex-col justify-center overflow-hidden rounded-[14px] border border-[var(--overlay-white-05)] bg-[var(--color-card)] px-6 py-5 shadow-sm"
            >
              <Container
                unstyled
                className="relative z-10 flex w-full flex-row items-center justify-between gap-4"
              >
                <Text className="text-sm font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
                  {tabMessages.paycheck.net}
                </Text>
                <Text
                  className={`text-3xl font-black tracking-tight ${isNetNegative ? "text-[var(--color-danger-soft)]" : "text-[var(--color-accent)]"}`}
                >
                  {salarySimulatorService.formatCurrency(payroll.netPay)}
                </Text>
              </Container>
            </Container>

            <Button
              variant="contained"
              onClick={onOpenLaunchSalaryDialog}
              disabled={payroll.netPay <= 0}
            >
              {tabMessages.launchSalary}
            </Button>

            {isTemporaryCalculation && calculationSetting && (
              <Container
                unstyled
                className="mt-4 rounded border border-[var(--color-info)] bg-[var(--overlay-info-08)] p-3 shadow-inner"
              >
                <Text className="mb-1 text-sm font-bold text-[var(--color-info)]">
                  {tabMessages.temporaryCalc.title}
                </Text>
                <Text className="text-xs text-[var(--color-text-secondary)]">
                  {tabMessages.temporaryCalc.description} <br />
                  Vigência simulada:{" "}
                  {salarySimulatorService.formatDateBR(
                    calculationSetting.date_start,
                  )}{" "}
                  à{" "}
                  {salarySimulatorService.formatDateBR(
                    calculationSetting.date_end,
                  )}
                </Text>
              </Container>
            )}
          </Container>
        </CardContent>
      </Card>

      <Card className="h-full rounded-[14px]">
        <CardContent className="p-3">
          <Container unstyled className="flex flex-col gap-2">
            <Text className="font-heading font-bold">
              {tabMessages.summaryTitle}
            </Text>

            <SummaryRow
              label={tabMessages.summaryLabels.validityInCalculation}
              value={`${salarySimulatorService.formatDateBR(calculationSetting?.date_start ?? today)} ate ${salarySimulatorService.formatDateBR(calculationSetting?.date_end ?? "9999-12-31")}`}
            />
            <SummaryRow
              label={tabMessages.summaryLabels.hourValue}
              value={salarySimulatorService.formatCurrency(currentHourlyRate)}
            />
            <SummaryRow
              label={tabMessages.summaryLabels.proLabore}
              value={salarySimulatorService.formatCurrency(currentBaseSalary)}
            />
            <SummaryRow
              label={tabMessages.summaryLabels.grossPay}
              value={salarySimulatorService.formatCurrency(payroll.grossPay)}
              valueColor={colors.green}
              strong
            />
            <SummaryRow
              label={tabMessages.summaryLabels.profitAdvance}
              value={salarySimulatorService.formatCurrency(
                payroll.profitAdvance,
              )}
              valueColor={colors.green}
              strong
            />
            <SummaryRow
              label={`INSS (${inssLabel})`}
              value={salarySimulatorService.formatCurrency(inssDisplay)}
              valueColor={colors.red}
              strong
            />
            <SummaryRow
              label={`${tabMessages.summaryLabels.adminFee} (${adminFeeLabel})`}
              value={salarySimulatorService.formatCurrency(adminDisplay)}
              valueColor={colors.red}
              strong
            />

            <SummaryRow
              label={tabMessages.summaryLabels.totalDiscounts}
              value={salarySimulatorService.formatCurrency(
                Math.abs(payroll.totalDiscounts),
              )}
              strong
            />
          </Container>
        </CardContent>
      </Card>
    </Container>
  );
}

function SummaryRow({
  label,
  value,
  valueColor,
  strong,
}: {
  label: string;
  value: string;
  valueColor?: string;
  strong?: boolean;
}) {
  const valueClass =
    valueColor === colors.green
      ? "text-[var(--color-success)]"
      : valueColor === colors.red
        ? "text-[var(--color-error)]"
        : "text-[var(--color-text-primary)]";

  return (
    <Container
      unstyled
      className="flex items-center justify-between border-b border-[var(--color-border)]/50 py-1.5 last:border-0"
    >
      <Text
        className={`${strong ? "font-bold" : ""} text-[var(--color-text-secondary)]`}
      >
        {label}
      </Text>
      <Text
        className={`${strong ? "font-bold" : "font-semibold"} ${valueClass}`}
      >
        {value}
      </Text>
    </Container>
  );
}
