import { TransactionTypeId } from '@/config/constants';

export interface ParsedCsvRow {
  line: number;
  date: string;
  description: string;
  amount: number;
  transactionType: number;
  categoryName: string;
  notes: string;
}

export interface CsvParseResult {
  rows: ParsedCsvRow[];
  errors: string[];
}

const normalize = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

function splitRows(text: string): string[][] {
  const lines = text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .filter((line) => line.trim().length > 0);
  if (lines.length === 0) return [];
  const delimiter = lines[0].includes(';') ? ';' : ',';
  return lines.map((line) =>
    line.split(delimiter).map((cell) => cell.trim().replace(/^"|"$/g, '').trim()),
  );
}

function parseAmount(raw: string): number {
  const cleaned = raw.replace(/[R$\s]/gi, '');
  if (!cleaned) return NaN;
  const normalized =
    cleaned.includes(',') && cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.')
      ? cleaned.replace(/\./g, '').replace(',', '.')
      : cleaned.replace(/,/g, '');
  return Number(normalized);
}

function parseDate(raw: string): string {
  const value = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const match = value.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})/);
  if (!match) return '';
  const [, d, m, y] = match;
  const year = y.length === 2 ? `20${y}` : y;
  return `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

const HEADER_ALIASES: Record<string, string[]> = {
  date: ['data', 'date', 'dia'],
  description: ['descricao', 'description', 'historico', 'nome'],
  amount: ['valor', 'amount', 'value', 'preco'],
  category: ['categoria', 'category'],
  notes: ['notas', 'nota', 'notes', 'observacao', 'observacoes', 'obs'],
};

function findIndex(header: string[], key: string): number {
  const aliases = HEADER_ALIASES[key];
  return header.findIndex((cell) => aliases.includes(normalize(cell)));
}

export function parseTransactionsCsv(text: string): CsvParseResult {
  const table = splitRows(text);
  const errors: string[] = [];
  if (table.length < 2) {
    return { rows: [], errors: ['Arquivo vazio ou sem linhas de dados.'] };
  }

  const header = table[0];
  const idx = {
    date: findIndex(header, 'date'),
    description: findIndex(header, 'description'),
    amount: findIndex(header, 'amount'),
    category: findIndex(header, 'category'),
    notes: findIndex(header, 'notes'),
  };

  if (idx.description < 0 || idx.amount < 0 || idx.date < 0) {
    return {
      rows: [],
      errors: ['Cabeçalho inválido. Use as colunas: Data; Descrição; Valor; Categoria; Notas.'],
    };
  }

  const rows: ParsedCsvRow[] = [];
  for (let i = 1; i < table.length; i++) {
    const cells = table[i];
    const line = i + 1;
    const description = (cells[idx.description] ?? '').trim();
    const signedAmount = parseAmount(cells[idx.amount] ?? '');
    const date = parseDate(cells[idx.date] ?? '');

    if (!description) {
      errors.push(`Linha ${line}: descrição vazia.`);
      continue;
    }
    if (!Number.isFinite(signedAmount) || signedAmount === 0) {
      errors.push(`Linha ${line}: valor inválido.`);
      continue;
    }
    if (!date) {
      errors.push(`Linha ${line}: data inválida.`);
      continue;
    }

    rows.push({
      line,
      date,
      description,
      amount: Math.abs(signedAmount),
      transactionType: signedAmount < 0 ? TransactionTypeId.EXPENSE : TransactionTypeId.INCOME,
      categoryName: idx.category >= 0 ? (cells[idx.category] ?? '').trim() : '',
      notes: idx.notes >= 0 ? (cells[idx.notes] ?? '').trim() : '',
    });
  }

  return { rows, errors };
}

export function downloadCsv(content: string, fileName: string): void {
  const bom = String.fromCharCode(0xfeff);
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}
