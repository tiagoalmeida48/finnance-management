import { useCallback, useEffect, useState } from 'react';

export type Op = '+' | '-' | '×' | '÷' | null;

interface CalcState {
  display: string;
  prev: number | null;
  op: Op;
  waitingOperand: boolean;
  expression: string;
}

export interface HistoryEntry {
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

function saveHistory(items: HistoryEntry[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(items.slice(0, MAX_HISTORY)));
  } catch {
    return;
  }
}

function fmt(value: string): string {
  if (value === 'Erro') return value;
  const num = parseFloat(value);
  if (Number.isNaN(num)) return 'Erro';
  if (Math.abs(num) >= 1e12) return 'Erro';
  return parseFloat(num.toPrecision(10)).toString();
}

function compute(a: number, b: number, op: Op): number {
  switch (op) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '×':
      return a * b;
    case '÷':
      return b === 0 ? NaN : a / b;
    default:
      return b;
  }
}

let historyId = 0;

export function usePayrollCalculator() {
  const [state, setState] = useState<CalcState>(INITIAL);
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    const stored = loadHistory();
    if (stored.length > 0) historyId = Math.max(...stored.map((entry) => entry.id));
    return stored;
  });
  useEffect(() => {
    saveHistory(history);
  }, [history]);

  const inputDigit = useCallback((digit: string) => {
    setState((s) => {
      if (s.waitingOperand) {
        return { ...s, display: digit, waitingOperand: false, expression: s.expression + digit };
      }
      const newDisplay =
        s.display === '0' ? digit : s.display.length >= 12 ? s.display : s.display + digit;
      return {
        ...s,
        display: newDisplay,
        expression: s.expression.slice(0, -s.display.length) + newDisplay,
      };
    });
  }, []);

  const inputDecimal = useCallback(() => {
    setState((s) => {
      if (s.waitingOperand)
        return { ...s, display: '0.', waitingOperand: false, expression: s.expression + '0.' };
      if (s.display.includes('.')) return s;
      return { ...s, display: s.display + '.', expression: s.expression + '.' };
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
    setState((s) => {
      if (s.prev === null || s.op === null) return s;
      const current = parseFloat(s.display);
      const result = compute(s.prev, current, s.op);
      const res = fmt(String(result));
      if (res !== 'Erro') {
        const entry = { id: ++historyId, expression: `${s.prev} ${s.op} ${s.display}`, result: res };
        setHistory((items) => [entry, ...items].slice(0, MAX_HISTORY));
      }
      return { display: res, prev: null, op: null, waitingOperand: true, expression: res };
    });
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
    setHistory((items) => items.filter((entry) => entry.id !== id));
  }, []);

  const clearHistory = useCallback(() => setHistory([]), []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)
        return;
      const key = event.key;
      const actions: Record<string, () => void> = {
        '.': inputDecimal,
        ',': inputDecimal,
        '+': () => applyOp('+'),
        '-': () => applyOp('-'),
        '*': () => applyOp('×'),
        '/': () => applyOp('÷'),
        Enter: equals,
        '=': equals,
        Backspace: backspace,
        Escape: clear,
        Delete: clear,
        '%': percent,
      };
      if (key >= '0' && key <= '9') {
        event.preventDefault();
        inputDigit(key);
        return;
      }
      if (actions[key]) {
        event.preventDefault();
        actions[key]();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [inputDigit, inputDecimal, applyOp, equals, backspace, clear, percent]);

  return {
    display: state.display,
    expression: state.expression,
    history,
    inputDigit,
    inputDecimal,
    toggleSign,
    percent,
    applyOp,
    equals,
    clear,
    backspace,
    applyHistoryResult,
    deleteHistoryEntry,
    clearHistory,
  };
}
