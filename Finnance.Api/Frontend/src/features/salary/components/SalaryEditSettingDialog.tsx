import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from '@/shared/components/ui';
import type { EditSettingForm } from '../types/salary.types';

interface SalaryEditSettingDialogProps {
  editForm: EditSettingForm | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: () => void;
  onFieldChange: (field: keyof EditSettingForm, value: string) => void;
}

export function SalaryEditSettingDialog({
  editForm,
  isSaving,
  onClose,
  onSave,
  onFieldChange,
}: SalaryEditSettingDialogProps) {
  return (
    <Dialog open={Boolean(editForm)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar vigência salarial</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="salary-edit-start">Data de início</Label>
              <Input
                id="salary-edit-start"
                type="date"
                className="w-full"
                value={editForm?.dateStart ?? ''}
                onChange={(event) => onFieldChange('dateStart', event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="salary-edit-end">Data de fim</Label>
              <Input
                id="salary-edit-end"
                type="date"
                className="w-full"
                value={editForm?.dateEnd ?? ''}
                onChange={(event) => onFieldChange('dateEnd', event.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="salary-edit-hourly">Valor da hora (R$)</Label>
            <Input
              id="salary-edit-hourly"
              type="number"
              step="0.01"
              min="0"
              className="w-full"
              value={editForm?.hourlyRate ?? ''}
              onChange={(event) => onFieldChange('hourlyRate', event.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="salary-edit-base">Pró-labore (R$)</Label>
            <Input
              id="salary-edit-base"
              type="number"
              step="0.01"
              min="0"
              className="w-full"
              value={editForm?.baseSalary ?? ''}
              onChange={(event) => onFieldChange('baseSalary', event.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="salary-edit-inss">Desconto INSS (%)</Label>
              <Input
                id="salary-edit-inss"
                type="number"
                step="0.01"
                min="0"
                max="100"
                className="w-full"
                value={editForm?.inssPercentage ?? ''}
                onChange={(event) => onFieldChange('inssPercentage', event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="salary-edit-admin">Taxa administrativa (%)</Label>
              <Input
                id="salary-edit-admin"
                type="number"
                step="0.01"
                min="0"
                max="100"
                className="w-full"
                value={editForm?.adminFeePercentage ?? ''}
                onChange={(event) => onFieldChange('adminFeePercentage', event.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={onSave} loading={isSaving}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
