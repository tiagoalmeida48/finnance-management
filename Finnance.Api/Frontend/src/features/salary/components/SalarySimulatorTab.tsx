import { Button, Card, CardContent, Input, Label } from '@/shared/components/ui';
import { formatCurrency } from '@/shared/utils';
import { buildSettingKey, formatValidity } from '../constants';
import type { PayrollResult, SalarySetting } from '../types/salary.types';

interface SimulatorPanelProps {
  availableSettings: SalarySetting[];
  currentSetting: SalarySetting | null;
  selectedSettingInputKey: string;
  onSelectedSettingChange: (value: string) => void;
  totalHours: string;
  onHoursChange: (value: string) => void;
  onHoursBlur: () => void;
  payroll: PayrollResult;
  isNetNegative: boolean;
  calculationSetting: SalarySetting | null;
  isTemporaryCalculation: boolean;
  onOpenLaunchDialog: () => void;
}

export function SalarySimulatorPanel({
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
  isTemporaryCalculation,
  onOpenLaunchDialog,
}: SimulatorPanelProps) {
  return (
    <Card className="h-full">
      <CardContent className="space-y-4">
        <h3 className="font-semibold text-text">Simular folha</h3>

        <div>
          <Label htmlFor="salary-validity">Vigência selecionada</Label>
          <select
            id="salary-validity"
            value={selectedSettingInputKey}
            onChange={(event) => onSelectedSettingChange(event.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-text transition-colors focus-visible:border-primary"
          >
            {availableSettings.map((setting) => {
              const key = buildSettingKey(setting);
              const isCurrent = currentSetting ? key === buildSettingKey(currentSetting) : false;
              return (
                <option key={`setting-${key}`} value={key}>
                  {formatValidity(setting)}
                  {isCurrent ? ' (atual)' : ''}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <Label htmlFor="salary-hours">Total de horas</Label>
          <Input
            id="salary-hours"
            type="number"
            value={totalHours}
            onChange={(event) => event.target.value.length <= 5 && onHoursChange(event.target.value)}
            onFocus={(event) => event.target.select()}
            onBlur={onHoursBlur}
            min={0}
            step={0.1}
            className="w-full"
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3">
          <span className="text-sm font-medium uppercase tracking-wide text-text-muted">Líquido</span>
          <span
            className={`text-3xl font-black tracking-tight ${isNetNegative ? 'text-expense' : 'text-income'}`}
          >
            {formatCurrency(payroll.netPay)}
          </span>
        </div>

        <Button onClick={onOpenLaunchDialog} disabled={payroll.netPay <= 0} className="w-full">
          Lançar salário
        </Button>

        {isTemporaryCalculation && calculationSetting && (
          <div className="rounded-md border border-primary/40 bg-primary/10 p-3 text-sm">
            <p className="font-semibold text-text">Cálculo temporário</p>
            <p className="text-text-muted">
              Você está simulando uma vigência diferente da atual. Vigência simulada:{' '}
              {formatValidity(calculationSetting)}.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface SimulatorSummaryProps {
  payroll: PayrollResult;
  calculationSetting: SalarySetting | null;
  currentHourlyRate: number;
  currentBaseSalary: number;
  inssLabel: string;
  adminFeeLabel: string;
  inssDisplay: number;
  adminDisplay: number;
}

export function SalarySimulatorSummary({
  payroll,
  calculationSetting,
  currentHourlyRate,
  currentBaseSalary,
  inssLabel,
  adminFeeLabel,
  inssDisplay,
  adminDisplay,
}: SimulatorSummaryProps) {
  return (
    <Card>
      <CardContent>
        <h3 className="mb-3 font-semibold text-text">Resumo do cálculo</h3>
        <div className="flex flex-col">
          <SummaryRow
            label="Vigência em cálculo"
            value={calculationSetting ? formatValidity(calculationSetting) : '-'}
          />
          <SummaryRow label="Valor da hora" value={formatCurrency(currentHourlyRate)} />
          <SummaryRow label="Pró-labore" value={formatCurrency(currentBaseSalary)} />
          <SummaryRow label="Bruto" value={formatCurrency(payroll.grossPay)} tone="income" bold />
          <SummaryRow
            label="Adiantamento de lucros"
            value={formatCurrency(payroll.profitAdvance)}
            tone="income"
            bold
          />
          <SummaryRow label={`INSS (${inssLabel})`} value={formatCurrency(inssDisplay)} tone="expense" bold />
          <SummaryRow
            label={`Taxa administrativa (${adminFeeLabel})`}
            value={formatCurrency(adminDisplay)}
            tone="expense"
            bold
          />
          <SummaryRow
            label="Total de descontos"
            value={formatCurrency(Math.abs(payroll.totalDiscounts))}
            bold
          />
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryRow({
  label,
  value,
  tone,
  bold,
}: {
  label: string;
  value: string;
  tone?: 'income' | 'expense';
  bold?: boolean;
}) {
  const valueClass =
    tone === 'income' ? 'text-income' : tone === 'expense' ? 'text-expense' : 'text-text';

  return (
    <div className="flex items-center justify-between border-b border-border/50 py-2 last:border-0">
      <span className={`text-sm ${bold ? 'font-semibold text-text' : 'text-text-muted'}`}>{label}</span>
      <span className={`text-sm font-bold ${valueClass}`}>{value}</span>
    </div>
  );
}
