import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import type { SalarySetting } from '../types/salary.types';

const salaryFormSchema = z.object({
  dateStart: z.string().min(1, 'Informe a data de início.'),
  baseSalary: z.number().min(0, 'Valor inválido.'),
  hourlyRate: z.number().min(0, 'Valor inválido.'),
  inssDiscountPercentage: z.number()
    .min(0, 'Percentual inválido.')
    .max(100, 'Máximo de 100%.'),
  adminFeePercentage: z.number()
    .min(0, 'Percentual inválido.')
    .max(100, 'Máximo de 100%.'),
});

export type SalaryFormValues = z.infer<typeof salaryFormSchema>;

interface SalarySettingFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: SalaryFormValues) => void;
  submitting: boolean;
  setting?: SalarySetting | null;
}

const emptyValues: SalaryFormValues = {
  dateStart: '',
  baseSalary: 0,
  hourlyRate: 0,
  inssDiscountPercentage: 0,
  adminFeePercentage: 0,
};

function toFormValues(setting?: SalarySetting | null): SalaryFormValues {
  if (!setting) return emptyValues;
  return {
    dateStart: setting.dateStart.slice(0, 10),
    baseSalary: setting.baseSalary,
    hourlyRate: setting.hourlyRate,
    inssDiscountPercentage: setting.inssDiscountPercentage,
    adminFeePercentage: setting.adminFeePercentage,
  };
}

export function SalarySettingFormModal({
  open,
  onOpenChange,
  onSubmit,
  submitting,
  setting,
}: SalarySettingFormModalProps) {
  const isEdit = Boolean(setting);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SalaryFormValues>({
    resolver: zodResolver(salaryFormSchema),
    defaultValues: toFormValues(setting),
  });

  useEffect(() => {
    if (open) reset(toFormValues(setting));
  }, [open, setting, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar vigência salarial' : 'Nova vigência salarial'}</DialogTitle>
        </DialogHeader>

        <form
          className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div>
            <Label htmlFor="dateStart">Data de início</Label>
            <Input id="dateStart" type="date" className="w-full" {...register('dateStart')} />
            {errors.dateStart && (
              <p className="mt-1 text-xs text-expense">{errors.dateStart.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="baseSalary">Salário base (R$)</Label>
            <Input
              id="baseSalary"
              type="number"
              step="0.01"
              min="0"
              className="w-full"
              {...register('baseSalary', { valueAsNumber: true })}
            />
            {errors.baseSalary && (
              <p className="mt-1 text-xs text-expense">{errors.baseSalary.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="hourlyRate">Valor da hora (R$)</Label>
            <Input
              id="hourlyRate"
              type="number"
              step="0.01"
              min="0"
              className="w-full"
              {...register('hourlyRate', { valueAsNumber: true })}
            />
            {errors.hourlyRate && (
              <p className="mt-1 text-xs text-expense">{errors.hourlyRate.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="inssDiscountPercentage">Desconto INSS (%)</Label>
            <Input
              id="inssDiscountPercentage"
              type="number"
              step="0.01"
              min="0"
              max="100"
              className="w-full"
              {...register('inssDiscountPercentage', { valueAsNumber: true })}
            />
            {errors.inssDiscountPercentage && (
              <p className="mt-1 text-xs text-expense">{errors.inssDiscountPercentage.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="adminFeePercentage">Taxa administrativa (%)</Label>
            <Input
              id="adminFeePercentage"
              type="number"
              step="0.01"
              min="0"
              max="100"
              className="w-full"
              {...register('adminFeePercentage', { valueAsNumber: true })}
            />
            {errors.adminFeePercentage && (
              <p className="mt-1 text-xs text-expense">{errors.adminFeePercentage.message}</p>
            )}
          </div>

          <DialogFooter className="sm:col-span-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={submitting}>
              {isEdit ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
