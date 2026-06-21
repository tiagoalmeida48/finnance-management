import { useState } from 'react';
import { History } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui';
import { usePayrollCalculator } from '../hooks/usePayrollCalculator';
import { CalculatorHistory } from './CalculatorHistory';

export function PayrollCalculatorTab() {
  const calc = usePayrollCalculator();
  const [showHistory, setShowHistory] = useState(false);
  const isError = calc.display === 'Erro';

  return (
    <div className="relative">
      <Card>
        <CardContent className="space-y-3">
          <div className="relative rounded-lg bg-surface-2 px-4 py-3 text-right">
            <button
              type="button"
              onClick={() => setShowHistory((value) => !value)}
              title="Histórico"
              className={`absolute left-3 top-3 rounded p-1.5 transition-colors ${showHistory ? 'bg-primary text-bg' : 'text-text-muted hover:bg-surface'}`}
            >
              <History size={16} />
            </button>
            <p className="block h-4 truncate text-xs text-text-muted">{calc.expression || ' '}</p>
            <p
              className={`truncate text-3xl font-black tracking-tight ${isError ? 'text-expense' : 'text-text'}`}
            >
              {calc.display}
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <CalcButton label="C" onClick={calc.clear} variant="action" />
            <CalcButton label="+/-" onClick={calc.toggleSign} variant="action" />
            <CalcButton label="%" onClick={calc.percent} variant="action" />
            <CalcButton label="÷" onClick={() => calc.applyOp('÷')} variant="op" />
            <CalcButton label="7" onClick={() => calc.inputDigit('7')} />
            <CalcButton label="8" onClick={() => calc.inputDigit('8')} />
            <CalcButton label="9" onClick={() => calc.inputDigit('9')} />
            <CalcButton label="×" onClick={() => calc.applyOp('×')} variant="op" />
            <CalcButton label="4" onClick={() => calc.inputDigit('4')} />
            <CalcButton label="5" onClick={() => calc.inputDigit('5')} />
            <CalcButton label="6" onClick={() => calc.inputDigit('6')} />
            <CalcButton label="-" onClick={() => calc.applyOp('-')} variant="op" />
            <CalcButton label="1" onClick={() => calc.inputDigit('1')} />
            <CalcButton label="2" onClick={() => calc.inputDigit('2')} />
            <CalcButton label="3" onClick={() => calc.inputDigit('3')} />
            <CalcButton label="+" onClick={() => calc.applyOp('+')} variant="op" />
            <CalcButton label="⌫" onClick={calc.backspace} variant="action" />
            <CalcButton label="0" onClick={() => calc.inputDigit('0')} />
            <CalcButton label="," onClick={calc.inputDecimal} />
            <CalcButton label="=" onClick={calc.equals} variant="equals" />
          </div>
        </CardContent>
      </Card>

      {showHistory && (
        <CalculatorHistory
          history={calc.history}
          onClose={() => setShowHistory(false)}
          onClear={calc.clearHistory}
          onUseResult={(result) => {
            calc.applyHistoryResult(result);
            setShowHistory(false);
          }}
          onDeleteEntry={calc.deleteHistoryEntry}
        />
      )}
    </div>
  );
}

function CalcButton({
  label,
  onClick,
  variant = 'digit',
}: {
  label: string;
  onClick: () => void;
  variant?: 'op' | 'action' | 'digit' | 'equals';
}) {
  const styles: Record<string, string> = {
    op: 'bg-primary/10 text-primary hover:bg-primary/20',
    action: 'bg-surface-2 text-text-muted hover:bg-border',
    digit: 'bg-surface-2/60 text-text hover:bg-surface-2',
    equals: 'bg-primary text-bg hover:opacity-90',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-14 w-full select-none items-center justify-center rounded-lg text-lg font-semibold transition-all active:scale-95 ${styles[variant]}`}
    >
      {label}
    </button>
  );
}
