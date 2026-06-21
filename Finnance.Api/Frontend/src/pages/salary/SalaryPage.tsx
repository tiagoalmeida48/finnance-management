import { useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Spinner,
} from '@/shared/components/ui';
import { formatCurrency, formatDate } from '@/shared/utils';
import {
  SalarySettingFormModal,
  useSalaryHistory,
  useCreateSalarySetting,
  useSimulatePayroll,
  type SalaryFormValues,
  type SalarySimulationResult,
} from '@/features/salary';

type Tab = 'history' | 'simulator';

export function SalaryPage() {
  const [tab, setTab] = useState<Tab>('history');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text">Salário</h1>
        <p className="text-text-muted">Gerencie vigências salariais e simule sua folha.</p>
      </div>

      <div className="flex gap-2 border-b border-border">
        <TabButton active={tab === 'history'} onClick={() => setTab('history')}>
          Vigências
        </TabButton>
        <TabButton active={tab === 'simulator'} onClick={() => setTab('simulator')}>
          Simulador de folha
        </TabButton>
      </div>

      {tab === 'history' ? <HistoryTab /> : <SimulatorTab />}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium transition-colors ${
        active ? 'border-b-2 border-primary text-text' : 'text-text-muted'
      }`}
    >
      {children}
    </button>
  );
}

function HistoryTab() {
  const { data, isLoading, isError } = useSalaryHistory();
  const create = useCreateSalarySetting();
  const [formOpen, setFormOpen] = useState(false);

  const submit = (values: SalaryFormValues) => {
    create.mutate(values, { onSuccess: () => setFormOpen(false) });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return <p className="text-expense">Não foi possível carregar as vigências.</p>;
  }

  const settings = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setFormOpen(true)}>Nova vigência</Button>
      </div>

      {settings.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-text-muted">
            Nenhuma vigência salarial cadastrada.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {settings.map((s) => (
            <Card key={s.settingsSalary}>
              <CardHeader>
                <CardTitle>
                  {formatDate(s.dateStart)} — {s.active ? 'Em aberto' : formatDate(s.dateEnd)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-text-muted">
                <p>Salário base: {formatCurrency(s.baseSalary)}</p>
                <p>Valor hora: {formatCurrency(s.hourlyRate)}</p>
                <p>INSS: {s.inssDiscountPercentage}%</p>
                <p>Taxa adm.: {s.adminFeePercentage}%</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <SalarySettingFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={submit}
        submitting={create.isPending}
      />
    </div>
  );
}

function SimulatorTab() {
  const simulate = useSimulatePayroll();
  const [form, setForm] = useState({
    baseSalary: 0,
    hourlyRate: 0,
    extraHours: 0,
    inssDiscountPercentage: 0,
    adminFeePercentage: 0,
  });
  const [result, setResult] = useState<SalarySimulationResult | null>(null);

  const update = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: Number(value) }));
  };

  const run = () => {
    simulate.mutate(form, { onSuccess: (res) => setResult(res) });
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Entradas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Field label="Salário base" value={form.baseSalary} onChange={(v) => update('baseSalary', v)} />
          <Field label="Valor hora" value={form.hourlyRate} onChange={(v) => update('hourlyRate', v)} />
          <Field label="Horas extras" value={form.extraHours} onChange={(v) => update('extraHours', v)} />
          <Field
            label="INSS (%)"
            value={form.inssDiscountPercentage}
            onChange={(v) => update('inssDiscountPercentage', v)}
          />
          <Field
            label="Taxa adm. (%)"
            value={form.adminFeePercentage}
            onChange={(v) => update('adminFeePercentage', v)}
          />
          <Button onClick={run} loading={simulate.isPending} className="w-full">
            Calcular folha
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultado</CardTitle>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-2">
              <ResultRow label="Bruto" value={result.gross} />
              <ResultRow label="Desconto INSS" value={-result.inss} negative />
              <ResultRow label="Taxa administrativa" value={-result.adminFee} negative />
              <div className="border-t border-border pt-2">
                <ResultRow label="Líquido" value={result.net} strong />
              </div>
            </div>
          ) : (
            <p className="text-text-muted">Preencha as entradas e calcule.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input type="number" value={value} onChange={(e) => onChange(e.target.value)} className="w-full" />
    </div>
  );
}

function ResultRow({
  label,
  value,
  negative,
  strong,
}: {
  label: string;
  value: number;
  negative?: boolean;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={strong ? 'font-semibold text-text' : 'text-text-muted'}>{label}</span>
      <span className={negative ? 'text-expense' : strong ? 'font-semibold text-income' : 'text-text'}>
        {formatCurrency(value)}
      </span>
    </div>
  );
}
