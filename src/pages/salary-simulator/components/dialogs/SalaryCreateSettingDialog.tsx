import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { messages } from "@/shared/i18n/messages";
import { Container } from "@/shared/components/layout/Container";

interface SalaryCreateSettingDialogProps {
  open: boolean;
  isSaving: boolean;
  dateStart: string;
  hourlyRate: string;
  baseSalary: string;
  inssPercentage: string;
  adminFeePercentage: string;
  onClose: () => void;
  onSave: () => void;
  onDateStartChange: (value: string) => void;
  onHourlyRateChange: (value: string) => void;
  onBaseSalaryChange: (value: string) => void;
  onInssPercentageChange: (value: string) => void;
  onAdminFeePercentageChange: (value: string) => void;
}

export function SalaryCreateSettingDialog({
  open,
  isSaving,
  dateStart,
  hourlyRate,
  baseSalary,
  inssPercentage,
  adminFeePercentage,
  onClose,
  onSave,
  onDateStartChange,
  onHourlyRateChange,
  onBaseSalaryChange,
  onInssPercentageChange,
  onAdminFeePercentageChange,
}: SalaryCreateSettingDialogProps) {
  const dialogMessages = messages.salarySimulator.createDialog;
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{dialogMessages.title}</DialogTitle>
      <DialogContent className="pt-2">
        <Container unstyled className="grid grid-cols-12 gap-1.5">
          <Container unstyled className="col-span-12">
            <Container unstyled className="space-y-0.5">
              <Label className="text-xs text-[var(--color-text-secondary)]">
                {dialogMessages.labels.startDate}
              </Label>
              <Input
                type="date"
                value={dateStart}
                onChange={(event) => onDateStartChange(event.target.value)}
                className="w-full cursor-pointer [color-scheme:dark]"
              />
            </Container>
          </Container>

          <Container unstyled className="col-span-12 grid grid-cols-2 gap-3">
            <Container unstyled className="space-y-0.5">
              <Label className="text-xs text-[var(--color-text-secondary)]">
                {dialogMessages.labels.hourValue}
              </Label>
              <Input
                type="number"
                value={hourlyRate}
                onChange={(event) => onHourlyRateChange(event.target.value)}
                min={0}
                step="0.01"
              />
            </Container>
            <Container unstyled className="space-y-0.5">
              <Label className="text-xs text-[var(--color-text-secondary)]">
                {dialogMessages.labels.minimumSalary}
              </Label>
              <Input
                type="number"
                value={baseSalary}
                onChange={(event) => onBaseSalaryChange(event.target.value)}
                min={0}
                step="0.01"
              />
            </Container>
          </Container>

          <Container unstyled className="col-span-12 md:col-span-6">
            <Container unstyled className="space-y-0.5">
              <Label className="text-xs text-[var(--color-text-secondary)]">
                {dialogMessages.labels.inss}
              </Label>
              <Input
                type="number"
                value={inssPercentage}
                onChange={(event) => onInssPercentageChange(event.target.value)}
                min={0}
                max={100}
                step="0.01"
              />
            </Container>
          </Container>
          <Container unstyled className="col-span-12 md:col-span-6">
            <Container unstyled className="space-y-0.5">
              <Label className="text-xs text-[var(--color-text-secondary)]">
                {dialogMessages.labels.adminFee}
              </Label>
              <Input
                type="number"
                value={adminFeePercentage}
                onChange={(event) =>
                  onAdminFeePercentageChange(event.target.value)
                }
                min={0}
                max={100}
                step="0.01"
              />
            </Container>
          </Container>

          <Container unstyled className="col-span-12">
            <Container
              unstyled
              className="flex flex-col-reverse justify-end gap-1 sm:flex-row"
            >
              <Button variant="text" onClick={onClose} disabled={isSaving}>
                {messages.common.actions.cancel}
              </Button>
              <Button variant="contained" onClick={onSave} disabled={isSaving}>
                {isSaving ? dialogMessages.saving : dialogMessages.save}
              </Button>
            </Container>
          </Container>
        </Container>
      </DialogContent>
    </Dialog>
  );
}
