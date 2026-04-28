import { useState, useCallback, useEffect, useRef } from 'react';
import { Trash2, X, History } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Container } from '@/shared/components/layout/Container';
import { Text } from '@/shared/components/ui/Text';

type Op = '+' | '-' | '×' | '÷' | null;

interface CalcState {
  display: string;
  prev: number | null;
  op: Op;
  waitingOperand: boolean;
  expression: string;
}

interface HistoryEntry {
  id: number;
  expression: string;
  result: string;
}

const INITIAL: CalcState = {
  display: '0',
  prev: null,
  op: null,
  waitingOperand: false,
  expression: '',
};

const LS_KEY = 'calc_history';
const MAX_HISTORY = 10;

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(h: HistoryEntry[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(h.slice(0, MAX_HISTORY)));
  } catch { return; }
}

function fmt(value: string): string {
  if (value === 'Erro') return value;
  const num = parseFloat(value);
  if (isNaN(num)) return 'Erro';
  if (Math.abs(num) >= 1e12) return 'Erro';
  return parseFloat(num.toPrecision(10)).toString();
}

function compute(a: number, b: number, op: Op): number {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '×': return a * b;
    case '÷': return b === 0 ? NaN : a / b;
    default: return b;
  }
}

let historyId = 0;

export function PayrollCalculatorTab() {
  const [state, setState] = useState<CalcState>(INITIAL);
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    const stored = loadHistory();
    if (stored.length > 0) historyId = Math.max(...stored.map((e) => e.id));
    return stored;
  });
  const [showHistory, setShowHistory] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  const inputDigit = useCallback((digit: string) => {
    setState((s) => {
      if (s.waitingOperand) {
        return { ...s, display: digit, waitingOperand: false, expression: s.expression + digit };
      }
      const newDisplay = s.display === '0' ? digit : s.display.length >= 12 ? s.display : s.display + digit;
      return { ...s, display: newDisplay, expression: s.expression.slice(0, -s.display.length) + newDisplay };
    });
  }, []);

  const inputDecimal = useCallback(() => {
    setState((s) => {
      if (s.waitingOperand) return { ...s, display: '0.', waitingOperand: false, expression: s.expression + '0.' };
      if (s.display.includes('.')) return s;
      const newDisplay = s.display + '.';
      return { ...s, display: newDisplay, expression: s.expression + '.' };
    });
  }, []);

  const toggleSign = useCallback(() => {
    setState((s) => ({ ...s, display: String(parseFloat(s.display) * -1) }));
  }, []);

  const percent = useCallback(() => {
    setState((s) => ({ ...s, display: fmt(String(parseFloat(s.display) / 100)) }));
  }, []);

  const applyOp = useCallback((op: Op) => {
    setState((s) => {
      const current = parseFloat(s.display);
      const opStr = ` ${op} `;
      if (s.prev !== null && !s.waitingOperand) {
        const result = compute(s.prev, current, s.op);
        const res = fmt(String(result));
        return { display: res, prev: result, op, waitingOperand: true, expression: res + opStr };
      }
      return { ...s, prev: current, op, waitingOperand: true, expression: s.display + opStr };
    });
  }, []);

  const equals = useCallback(() => {
    const s = stateRef.current;
    if (s.prev === null || s.op === null) return;
    const current = parseFloat(s.display);
    const result = compute(s.prev, current, s.op);
    const res = fmt(String(result));
    if (res !== 'Erro') {
      const entry = { id: ++historyId, expression: `${s.prev} ${s.op} ${s.display}`, result: res };
      setHistory((h) => [entry, ...h].slice(0, MAX_HISTORY));
    }
    setState({ display: res, prev: null, op: null, waitingOperand: true, expression: res });
  }, []);

  const clear = useCallback(() => setState(INITIAL), []);

  const backspace = useCallback(() => {
    setState((s) => {
      if (s.waitingOperand) return s;
      const next = s.display.length > 1 ? s.display.slice(0, -1) : '0';
      return { ...s, display: next, expression: s.expression.slice(0, -1) };
    });
  }, []);

  const applyHistoryResult = useCallback((result: string) => {
    setState((s) => ({
      ...s,
      display: result,
      waitingOperand: true,
      expression: s.op ? s.expression + result : result,
    }));
  }, []);

  const deleteHistoryEntry = useCallback((id: number) => {
    setHistory((h) => h.filter((e) => e.id !== id));
  }, []);

  const clearHistory = useCallback(() => setHistory([]), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key;
      if (key >= '0' && key <= '9') { e.preventDefault(); inputDigit(key); return; }
      if (key === '.' || key === ',') { e.preventDefault(); inputDecimal(); return; }
      if (key === '+') { e.preventDefault(); applyOp('+'); return; }
      if (key === '-') { e.preventDefault(); applyOp('-'); return; }
      if (key === '*') { e.preventDefault(); applyOp('×'); return; }
      if (key === '/') { e.preventDefault(); applyOp('÷'); return; }
      if (key === 'Enter' || key === '=') { e.preventDefault(); equals(); return; }
      if (key === 'Backspace') { e.preventDefault(); backspace(); return; }
      if (key === 'Escape') { e.preventDefault(); clear(); return; }
      if (key === 'Delete') { e.preventDefault(); clear(); return; }
      if (key === '%') { e.preventDefault(); percent(); return; }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [inputDigit, inputDecimal, applyOp, equals, backspace, clear, percent]);

  const isError = state.display === 'Erro';

  const btn = (label: string, onClick: () => void, variant: 'op' | 'action' | 'digit' | 'equals' = 'digit', key?: string) => {
    const base = 'flex items-center justify-center rounded-[12px] text-lg font-semibold h-14 w-full cursor-pointer select-none transition-all duration-100 active:scale-95';
    const styles: Record<string, string> = {
      op: 'bg-[var(--overlay-primary-08)] text-[var(--color-primary)] hover:bg-[var(--overlay-primary-12)]',
      action: 'bg-[var(--overlay-white-05)] text-[var(--color-text-secondary)] hover:bg-[var(--overlay-white-08)]',
      digit: 'bg-[var(--overlay-white-03)] text-[var(--color-text-primary)] hover:bg-[var(--overlay-white-05)]',
      equals: 'bg-[var(--color-primary)] text-[var(--color-background)] hover:opacity-90',
    };
    return (
      <button key={key ?? label} onClick={onClick} className={`${base} ${styles[variant]}`}>
        {label}
      </button>
    );
  };

  return (
    <Container unstyled className="relative">
      <Card className="rounded-[18px]">
        <CardContent className="p-4">
          <Container unstyled className="flex flex-col gap-3">
            <Container
              unstyled
              className="relative rounded-[12px] bg-[var(--overlay-white-03)] px-4 py-3 text-right"
            >
              <button
                onClick={() => setShowHistory((v) => !v)}
                title="Histórico"
                className={`absolute left-3 top-3 rounded-[8px] p-1.5 transition-colors ${showHistory ? 'bg-[var(--color-primary)] text-[var(--color-background)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--overlay-white-05)]'}`}
              >
                <History size={16} />
              </button>

              <Text className="text-xs text-[var(--color-text-secondary)] h-4 truncate block">
                {state.expression || ' '}
              </Text>
              <Text
                className={`text-3xl font-black tracking-tight truncate ${isError ? 'text-[var(--color-error)]' : 'text-[var(--color-text-primary)]'}`}
              >
                {state.display}
              </Text>
            </Container>

            <Container unstyled className="grid grid-cols-4 gap-2">
              {btn('C', clear, 'action')}
              {btn('+/-', toggleSign, 'action')}
              {btn('%', percent, 'action')}
              {btn('÷', () => applyOp('÷'), 'op')}

              {btn('7', () => inputDigit('7'))}
              {btn('8', () => inputDigit('8'))}
              {btn('9', () => inputDigit('9'))}
              {btn('×', () => applyOp('×'), 'op')}

              {btn('4', () => inputDigit('4'))}
              {btn('5', () => inputDigit('5'))}
              {btn('6', () => inputDigit('6'))}
              {btn('-', () => applyOp('-'), 'op')}

              {btn('1', () => inputDigit('1'))}
              {btn('2', () => inputDigit('2'))}
              {btn('3', () => inputDigit('3'))}
              {btn('+', () => applyOp('+'), 'op')}

              {btn('⌫', backspace, 'action')}
              {btn('0', () => inputDigit('0'))}
              {btn(',', inputDecimal)}
              {btn('=', equals, 'equals')}
            </Container>
          </Container>
        </CardContent>
      </Card>

      {showHistory && (
        <Container
          unstyled
          className="absolute inset-0 z-10 rounded-[18px] border border-[var(--color-border)] bg-[var(--color-card)] flex flex-col"
        >
          <Container unstyled className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
            <Text className="text-sm font-bold text-[var(--color-text-primary)]">Histórico</Text>
            <Container unstyled className="flex items-center gap-2">
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="flex items-center gap-1 rounded px-2 py-1 text-xs text-[var(--color-error)] hover:bg-[var(--overlay-error-08)] transition-colors"
                >
                  <Trash2 size={12} />
                  Limpar
                </button>
              )}
              <button
                onClick={() => setShowHistory(false)}
                className="rounded-[8px] p-1.5 text-[var(--color-text-secondary)] hover:bg-[var(--overlay-white-05)] hover:text-[var(--color-text-primary)] transition-colors"
                title="Fechar histórico"
              >
                <X size={16} />
              </button>
            </Container>
          </Container>

          {history.length === 0 ? (
            <Container unstyled className="flex flex-1 items-center justify-center">
              <Text className="text-sm text-[var(--color-text-secondary)]">Nenhum cálculo ainda.</Text>
            </Container>
          ) : (
            <Container
              unstyled
              className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col divide-y divide-[var(--color-border)]/40"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.12) transparent' }}
            >
              {history.map((entry) => (
                <Container
                  key={entry.id}
                  unstyled
                  className="group flex items-center justify-between gap-2 py-2 first:pt-1 last:pb-1"
                >
                  <button
                    onClick={() => { applyHistoryResult(entry.result); setShowHistory(false); }}
                    className="flex-1 min-w-0 text-left rounded-[6px] px-1 py-0.5 hover:bg-[var(--overlay-white-03)] transition-colors"
                    title="Usar resultado e fechar"
                  >
                    <Text className="text-xs truncate text-[var(--color-text-secondary)]">
                      {entry.expression} = <span className="font-bold text-[var(--color-text-primary)]">{entry.result}</span>
                    </Text>
                  </button>
                  <button
                    onClick={() => deleteHistoryEntry(entry.id)}
                    className="shrink-0 opacity-0 group-hover:opacity-100 text-[var(--color-text-secondary)] hover:text-[var(--color-error)] transition-all"
                  >
                    <X size={13} />
                  </button>
                </Container>
              ))}
            </Container>
          )}
        </Container>
      )}
    </Container>
  );
}
