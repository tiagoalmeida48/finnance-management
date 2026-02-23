import type { Transaction } from "../interfaces";

const DISALLOWED_GROUP_FIELDS: Array<keyof Transaction> = [
  "id",
  "installment_number",
  "installment_group_id",
  "recurring_group_id",
  "invoice_id",
  "created_at",
  "updated_at",
  "user_id",
  "total_installments",
];

export const filterGroupUpdates = (updates: Partial<Transaction>) =>
  Object.fromEntries(
    Object.entries(updates).filter(
      ([key]) => !DISALLOWED_GROUP_FIELDS.includes(key as keyof Transaction),
    ),
  ) as Partial<Transaction>;

const DATE_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/;
const INSTALLMENT_SUFFIX_PATTERN = /\(\s*\d+\s*\/\s*\d+\s*\)\s*$/i;

const pad = (value: number) => value.toString().padStart(2, "0");
const normalizeWhitespace = (value: string) =>
  value.replace(/\s+/g, " ").trim();

interface DateParts {
  year: number;
  month: number;
  day: number;
}

const parseDateParts = (value?: string | null): DateParts | null => {
  if (!value) return null;
  const match = value.match(DATE_KEY_PATTERN);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  )
    return null;
  if (month < 1 || month > 12) return null;

  const maxDay = new Date(year, month, 0).getDate();
  if (day < 1 || day > maxDay) return null;

  return { year, month, day };
};

export const extractDayFromDateLike = (value?: string | null) => {
  const parts = parseDateParts(value);
  return parts?.day ?? null;
};

export const replaceDateDayPreservingMonth = (
  value: string | null | undefined,
  targetDay: number,
) => {
  const parts = parseDateParts(value);
  if (!parts) return null;
  if (!Number.isInteger(targetDay) || targetDay < 1 || targetDay > 31)
    return null;

  const maxDay = new Date(parts.year, parts.month, 0).getDate();
  const clampedDay = Math.min(targetDay, maxDay);

  return `${parts.year}-${pad(parts.month)}-${pad(clampedDay)}`;
};

export const shiftDateByMonths = (
  value: string | null | undefined,
  monthOffset: number,
) => {
  const parts = parseDateParts(value);
  if (!parts || !Number.isInteger(monthOffset)) return null;

  const shiftedMonthDate = new Date(
    parts.year,
    parts.month - 1 + monthOffset,
    1,
  );
  if (Number.isNaN(shiftedMonthDate.getTime())) return null;

  const shiftedYear = shiftedMonthDate.getFullYear();
  const shiftedMonth = shiftedMonthDate.getMonth() + 1;
  const maxDay = new Date(shiftedYear, shiftedMonth, 0).getDate();
  const day = Math.min(parts.day, maxDay);

  return `${shiftedYear}-${pad(shiftedMonth)}-${pad(day)}`;
};

export const toDateKeyIgnoringTime = (value?: string | null) => {
  const parts = parseDateParts(value);
  if (!parts) return null;
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;
};

export const stripInstallmentSuffix = (description?: string | null) => {
  const normalized = normalizeWhitespace(description || "");
  if (!normalized) return "";

  return normalizeWhitespace(
    normalized.replace(INSTALLMENT_SUFFIX_PATTERN, ""),
  );
};

export const buildInstallmentDescription = (
  baseDescription: string,
  installmentNumber: number,
  totalInstallments: number,
) => {
  const safeBase = normalizeWhitespace(baseDescription || "");
  const safeInstallment = Math.max(1, Math.trunc(installmentNumber || 1));
  const safeTotal = Math.max(
    safeInstallment,
    Math.trunc(totalInstallments || 1),
  );

  return `${safeBase} (${safeInstallment.toString().padStart(2, "0")}/${safeTotal.toString().padStart(2, "0")})`;
};
