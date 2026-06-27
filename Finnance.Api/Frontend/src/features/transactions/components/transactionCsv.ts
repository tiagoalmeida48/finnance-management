import { TransactionTypeId } from '@/config/constants';

export interface ParsedCsvRow {
  line: number;
  description: string;
  amount: number;
  paymentDate: string;
  transactionType: number;
  categoryName: string;
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
  return Math.abs(Number(normalized));
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

function parseType(raw: string): number {
  const value = normalize(raw);
  if (value.startsWith('receita') || value === 'r' || value === 'income') {
    return TransactionTypeId.INCOME;
  }
  return TransactionTypeId.EXPENSE;
}

const HEADER_ALIASES: Record<string, string[]> = {
  date: ['data', 'date', 'dia'],
  description: ['descricao', 'descrição', 'description', 'historico', 'histórico', 'nome'],
  amount: ['valor', 'amount', 'value', 'preco', 'preço'],
  type: ['tipo', 'type'],
  category: ['categoria', 'category'],
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
    type: findIndex(header, 'type'),
    category: findIndex(header, 'category'),
  };

  if (idx.description < 0 || idx.amount < 0 || idx.date < 0) {
    return {
      rows: [],
      errors: ['Cabeçalho inválido. Use as colunas: data, descricao, valor, tipo, categoria.'],
    };
  }

  const rows: ParsedCsvRow[] = [];
  for (let i = 1; i < table.length; i++) {
    const cells = table[i];
    const line = i + 1;
    const description = (cells[idx.description] ?? '').trim();
    const amount = parseAmount(cells[idx.amount] ?? '');
    const paymentDate = parseDate(cells[idx.date] ?? '');

    if (!description) {
      errors.push(`Linha ${line}: descrição vazia.`);
      continue;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      errors.push(`Linha ${line}: valor inválido.`);
      continue;
    }
    if (!paymentDate) {
      errors.push(`Linha ${line}: data inválida.`);
      continue;
    }

    rows.push({
      line,
      description,
      amount,
      paymentDate,
      transactionType: idx.type >= 0 ? parseType(cells[idx.type] ?? '') : TransactionTypeId.EXPENSE,
      categoryName: idx.category >= 0 ? (cells[idx.category] ?? '').trim() : '',
    });
  }

  return { rows, errors };
}

export const CSV_TEMPLATE = 'data;descricao;valor;tipo;categoria';

const CSV_TEMPLATE_ROWS = [
  CSV_TEMPLATE,
  '05/06/2026;Salário;5000,00;receita;Salário',
  '12/06/2026;Mercado;350,90;despesa;Alimentação',
].join('\n');

export function downloadCsvTemplate(): void {
  const bom = String.fromCharCode(0xfeff);
  const blob = new Blob([bom + CSV_TEMPLATE_ROWS + '\n'], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'modelo-transacoes.csv';
  anchor.click();
  URL.revokeObjectURL(url);
}
