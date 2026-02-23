import { supabase } from "@/lib/supabase/client";
import type { Transaction, CreateTransactionData } from "../../interfaces";
import {
  stripInstallmentSuffix,
  toDateKeyIgnoringTime,
} from "@/shared/utils/transactionsGroup.utils";

export const DATE_LIKE_FIELDS: Array<keyof Transaction> = [
  "payment_date",
  "purchase_date",
];

export const hasOwn = <T extends object>(value: T, key: PropertyKey) =>
  Object.prototype.hasOwnProperty.call(value, key);

export const toComparableValue = (field: keyof Transaction, value: unknown) => {
  if (value === undefined || value === null || value === "") return null;

  if (DATE_LIKE_FIELDS.includes(field)) {
    return typeof value === "string"
      ? (toDateKeyIgnoringTime(value) ?? value)
      : null;
  }

  return value;
};

export const hasChangedValue = (
  field: keyof Transaction,
  currentValue: unknown,
  nextValue: unknown,
) =>
  toComparableValue(field, currentValue) !==
  toComparableValue(field, nextValue);

export const buildSingleTransactionCreatePayload = (
  transaction: Transaction,
  overrides: Partial<CreateTransactionData> = {},
): CreateTransactionData => {
  const payload: CreateTransactionData = {
    description: `${stripInstallmentSuffix(transaction.description) || transaction.description} (copia)`,
    amount: Number(transaction.amount) || 0,
    type: transaction.type,
    payment_date:
      toDateKeyIgnoringTime(transaction.payment_date) ??
      transaction.payment_date,
    purchase_date:
      toDateKeyIgnoringTime(transaction.purchase_date ?? undefined) ??
      transaction.purchase_date ??
      undefined,
    account_id: transaction.account_id ?? null,
    to_account_id: transaction.to_account_id ?? null,
    card_id: transaction.card_id ?? null,
    invoice_id: null,
    category_id: transaction.category_id ?? null,
    is_fixed: false,
    is_paid: false,
    installment_group_id: null,
    installment_number: null,
    total_installments: 1,
    recurring_group_id: null,
    notes: transaction.notes ?? null,
    payment_method: transaction.payment_method ?? null,
    is_installment: false,
    repeat_count: undefined,
  };

  return {
    ...payload,
    ...overrides,
  };
};

export const TRANSACTION_MUTATION_PAGE_SIZE = 1000;

export const UUID_LIKE_FIELDS = [
  "category_id",
  "account_id",
  "to_account_id",
  "card_id",
  "installment_group_id",
  "recurring_group_id",
  "invoice_id",
] as const;

export type CreatePayloadExtras = CreateTransactionData & {
  installment_amounts?: number[];
  user_id?: string;
};

export const sanitizeCreatePayload = (payload: CreatePayloadExtras) => {
  const sanitized: Record<string, unknown> = { ...payload };

  for (const field of UUID_LIKE_FIELDS) {
    if (sanitized[field] === "") {
      sanitized[field] = null;
    }
  }

  delete sanitized.id;
  delete sanitized.created_at;
  delete sanitized.updated_at;
  delete sanitized.bank_account;
  delete sanitized.to_bank_account;
  delete sanitized.category;
  delete sanitized.credit_card;

  delete sanitized.installment_amounts;
  delete sanitized.repeat_count;
  delete sanitized.is_installment;

  return sanitized;
};

export const requireAuthenticatedUserId = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) {
    throw new Error("Not authenticated");
  }

  return data.user.id;
};

export const normalizeToPositiveInteger = (
  value: unknown,
  fallback: number,
) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.trunc(parsed));
};

export const normalizeTargetDay = (value: unknown) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 31) {
    throw new Error("Dia invalido. Use um valor entre 1 e 31.");
  }
  return parsed;
};

export const sanitizeIds = (ids: string[]) =>
  Array.from(new Set(ids.filter(Boolean)));

export const syncBalance = async (
  transaction: Transaction,
  action: "add" | "remove",
) => {
  if (!transaction.account_id || !transaction.is_paid) return;

  const multiplier = action === "add" ? 1 : -1;
  const amount = Number(transaction.amount) || 0;

  let accountDelta = 0;
  let transferInDelta = 0;

  if (transaction.type === "income") {
    accountDelta = amount * multiplier;
  } else if (transaction.type === "expense") {
    accountDelta = -amount * multiplier;
  } else if (transaction.type === "transfer") {
    accountDelta = -amount * multiplier;
    transferInDelta = amount * multiplier;
  }

  if (transferInDelta !== 0 && transaction.to_account_id) {
    const { error } = await supabase.rpc("increment_account_balance", {
      p_account_id: transaction.to_account_id,
      p_amount: transferInDelta,
    });
    if (error) throw error;
  }

  if (accountDelta !== 0) {
    const { error } = await supabase.rpc("increment_account_balance", {
      p_account_id: transaction.account_id,
      p_amount: accountDelta,
    });
    if (error) throw error;
  }
};
