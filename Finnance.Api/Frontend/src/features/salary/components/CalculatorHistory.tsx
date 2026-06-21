import { Trash2, X } from 'lucide-react';
import type { HistoryEntry } from '../hooks/usePayrollCalculator';

interface CalculatorHistoryProps {
  history: HistoryEntry[];
  onClose: () => void;
  onClear: () => void;
  onUseResult: (result: string) => void;
  onDeleteEntry: (id: number) => void;
}

export function CalculatorHistory({
  history,
  onClose,
  onClear,
  onUseResult,
  onDeleteEntry,
}: CalculatorHistoryProps) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col rounded-lg border border-border bg-surface">
      <div className="flex shrink-0 items-center justify-between px-4 pb-2 pt-4">
        <p className="text-sm font-bold text-text">Histórico</p>
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs text-expense hover:bg-surface-2"
            >
              <Trash2 size={12} />
              Limpar
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1.5 text-text-muted hover:bg-surface-2 hover:text-text"
            title="Fechar histórico"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-text-muted">Nenhum cálculo ainda.</p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col divide-y divide-border/40 overflow-y-auto px-4 pb-4">
          {history.map((entry) => (
            <div key={entry.id} className="group flex items-center justify-between gap-2 py-2">
              <button
                type="button"
                onClick={() => onUseResult(entry.result)}
                className="min-w-0 flex-1 rounded px-1 py-0.5 text-left hover:bg-surface-2"
                title="Usar resultado e fechar"
              >
                <p className="truncate text-xs text-text-muted">
                  {entry.expression} = <span className="font-bold text-text">{entry.result}</span>
                </p>
              </button>
              <button
                type="button"
                onClick={() => onDeleteEntry(entry.id)}
                className="shrink-0 text-text-muted opacity-0 transition-all hover:text-expense group-hover:opacity-100"
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
