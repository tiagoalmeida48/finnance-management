import { Button, Card, CardContent, Spinner } from '@/shared/components/ui';
import { formatCurrency, formatDate } from '@/shared/utils';
import type { SalarySetting } from '../types/salary.types';

interface SalarySettingsTabProps {
  loadingHistory: boolean;
  history: SalarySetting[];
  onOpenEdit: (setting: SalarySetting) => void;
  onRequestClose: (setting: SalarySetting) => void;
  closePending: boolean;
}

const headerClass =
  'py-2 px-3 text-[11px] font-semibold uppercase tracking-wide text-text-muted';
const bodyClass = 'py-2 px-3 text-[13px] text-text-muted';

export function SalarySettingsTab({
  loadingHistory,
  history,
  onOpenEdit,
  onRequestClose,
  closePending,
}: SalarySettingsTabProps) {
  return (
    <Card>
      <CardContent className="space-y-3">
        <h3 className="font-semibold text-text">Histórico de vigências</h3>

        {loadingHistory ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="bg-surface-2/40">
                  <th className={`${headerClass} text-left`}>Vigência</th>
                  <th className={`${headerClass} text-right`}>Valor hora</th>
                  <th className={`${headerClass} text-right`}>Pró-labore</th>
                  <th className={`${headerClass} text-right`}>INSS</th>
                  <th className={`${headerClass} text-right`}>Taxa adm.</th>
                  <th className={`${headerClass} text-center`}>Status</th>
                  <th className={`${headerClass} text-center`}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {history.map((setting) => (
                  <tr
                    key={setting.settingsSalary}
                    className={`border-t border-border ${setting.active ? 'bg-primary/5' : ''}`}
                  >
                    <td className={bodyClass}>
                      {formatDate(setting.dateStart)} até{' '}
                      {setting.active ? 'Vigente' : formatDate(setting.dateEnd)}
                    </td>
                    <td className={`${bodyClass} text-right`}>{formatCurrency(setting.hourlyRate)}</td>
                    <td className={`${bodyClass} text-right`}>{formatCurrency(setting.baseSalary)}</td>
                    <td className={`${bodyClass} text-right`}>
                      {setting.inssDiscountPercentage.toFixed(2)}
                    </td>
                    <td className={`${bodyClass} text-right`}>
                      {setting.adminFeePercentage.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {setting.active ? (
                        <span className="inline-flex rounded bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
                          Vigente
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex justify-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => onOpenEdit(setting)}>
                          Editar
                        </Button>
                        {setting.active && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onRequestClose(setting)}
                            disabled={closePending}
                          >
                            Encerrar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-4 text-center text-sm text-text-muted">
                      Nenhuma vigência cadastrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
