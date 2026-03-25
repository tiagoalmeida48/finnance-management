import { addMonths, format } from "date-fns";
import type { Transaction, TransactionType } from "@/shared/interfaces";
import type {
  FileData,
  ImportPreviewRow,
} from "@/pages/transactions/components/modals/import/importTransactions.types";
import type { ImportPaymentMethod } from "@/pages/transactions/components/modals/import/useImportTransactionsModalLogic";

export const parseImportDate = (dateStr: string) => {
  if (!dateStr) return null;
  const normalizedDate = dateStr.trim();
  if (!normalizedDate) return null;

  const brFormat = normalizedDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (brFormat) {
    const [, day, month, year] = brFormat;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const isoFormat = normalizedDate.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoFormat) return normalizedDate;

  return null;
};

export const parseImportAmount = (value: string) => {
  const normalizedValue = value.trim();
  const cleanedValue = normalizedValue.includes(",")
    ? normalizedValue.replace(/\./g, "").replace(",", ".")
    : normalizedValue;
  return parseFloat(cleanedValue);
};

export const inferImportTransactionType = (amount: number): TransactionType =>
  amount >= 0 ? "income" : "expense";

export interface InstallmentParseResult {
  numbers: number[];
  totalInstallments: number;
}

const collapseWhitespace = (value: string) => value.replace(/\s+/g, " ").trim();

export const normalizeInstallmentDescriptionForGrouping = (
  description: string,
) => {
  const normalized = collapseWhitespace(description || "");
  if (!normalized) return "";

  return collapseWhitespace(
    normalized
      .replace(/\(\s*\d+\s*\/\s*\d+\s*\)/gi, "")
      .replace(/[-:–—]?\s*parcela\s*\d+\s*\/\s*\d+/gi, "")
      .replace(/\b\d+\s*\/\s*\d+\b/gi, "")
      .replace(/[-:–—]\s*$/g, ""),
  ).toLowerCase();
};

export const parseImportInstallments = (
  value?: string,
): InstallmentParseResult | null => {
  const normalized = (value || "").trim();

  if (!normalized) {
    return {
      numbers: [1],
      totalInstallments: 1,
    };
  }

  if (/^\d+$/.test(normalized)) {
    const total = Number(normalized);
    if (total < 1) return null;

    return {
      numbers: Array.from({ length: total }, (_, index) => index + 1),
      totalInstallments: total,
    };
  }

  const range = normalized.match(/^(\d+)\s*-\s*(\d+)$/);
  if (!range) return null;

  const start = Number(range[1]);
  const end = Number(range[2]);

  if (start < 1 || end < start) return null;

  return {
    numbers: Array.from(
      { length: end - start + 1 },
      (_, index) => start + index,
    ),
    totalInstallments: end,
  };
};

const shiftInstallmentDate = (dateValue?: string, installmentNumber = 1) => {
  if (!dateValue) return undefined;

  const parsedDate = new Date(`${dateValue}T12:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return dateValue;

  return format(addMonths(parsedDate, installmentNumber - 1), "yyyy-MM-dd");
};

const findByName = <T extends { name: string }>(
  items: T[] | undefined,
  targetName: string,
) => {
  const normalizedTargetName = targetName.trim().toLowerCase();
  if (!normalizedTargetName) return undefined;
  return items?.find(
    (item) => item.name.trim().toLowerCase() === normalizedTargetName,
  );
};

export const validateAndMapImportData = (
  previewData: FileData[],
  accounts: { id: string; name: string }[],
  categories: { id: string; name: string }[],
  cards: { id: string; name: string; bank_account_id?: string }[],
  paymentMethod: ImportPaymentMethod,
  selectedAccountId: string,
  selectedCardId: string,
) => {
  if (!previewData.length || !accounts || !categories || !cards) {
    return {
      mappedData: [] as ImportPreviewRow[],
      validTransactions: [] as Partial<Transaction>[],
    };
  }

  const selectedAccount = accounts.find(
    (account) => account.id === selectedAccountId,
  );
  const selectedCard = cards.find((card) => card.id === selectedCardId);

  const parsedRows: ImportPreviewRow[] = [];
  const normalizedTransactions: Partial<Transaction>[] = [];
  const installmentGroupIdsBySignature = new Map<string, string>();

  previewData.forEach((row) => {
    const amount = parseImportAmount(row.Valor || "");
    const amountIsInvalid = Number.isNaN(amount);
    const absoluteAmount = amountIsInvalid ? 0 : Math.abs(amount);
    const type: TransactionType = inferImportTransactionType(amount);

    const purchaseDate = parseImportDate(row.Data || "");
    const dateIsInvalid = !purchaseDate;

    const parsedInstallments = parseImportInstallments(row.Parcelas);
    const installmentsIsInvalid = !parsedInstallments;
    const installmentNumbers = parsedInstallments?.numbers || [1];
    const totalInstallments = parsedInstallments?.totalInstallments || 1;
    const installmentNumber =
      totalInstallments > 1 ? installmentNumbers[0] : undefined;

    const paymentDateRaw = row["Data de pagamento"] || "";
    const parsedPaymentDate = parseImportDate(paymentDateRaw);

    const paymentAccountByName = findByName(
      accounts,
      row["Conta de pagamento"] || "",
    );
    const resolvedAccountId =
      paymentMethod === "credit"
        ? selectedAccount?.id || selectedCard?.bank_account_id || undefined
        : selectedAccount?.id || paymentAccountByName?.id || undefined;

    const resolvedCardId =
      paymentMethod === "credit" ? selectedCard?.id || undefined : undefined;
    const entityIsInvalid =
      paymentMethod === "credit"
        ? !resolvedCardId || !resolvedAccountId
        : !resolvedAccountId;

    const category = findByName(categories, row.Categoria || "");

    const baseMapped: ImportPreviewRow["mapped"] = {
      description: row.Descrição || "",
      amount: absoluteAmount,
      type,
      purchase_date: purchaseDate || undefined,
      payment_date:
        paymentMethod === "credit"
          ? purchaseDate || undefined
          : parsedPaymentDate || purchaseDate || undefined,
      is_paid: paymentMethod === "credit" ? false : Boolean(parsedPaymentDate),
      is_fixed: false,
      recurring_group_id: undefined,
      installment_group_id: undefined,
      installment_number: installmentNumber,
      total_installments: totalInstallments > 1 ? totalInstallments : undefined,
      account_id: resolvedAccountId,
      card_id: resolvedCardId,
      category_id: category?.id || undefined,
      payment_method: paymentMethod,
      notes: row.Notas || undefined,
    };

    const isValid =
      !amountIsInvalid &&
      !dateIsInvalid &&
      !entityIsInvalid &&
      !installmentsIsInvalid;

    parsedRows.push({
      original: row,
      mapped: baseMapped,
      isValid,
      errors: {
        amount: amountIsInvalid,
        date: dateIsInvalid,
        entity: entityIsInvalid,
        installments: installmentsIsInvalid,
      },
    });

    if (!isValid) return;

    let installmentGroupId: string | undefined;

    if (totalInstallments > 1) {
      const normalizedDescription = normalizeInstallmentDescriptionForGrouping(
        baseMapped.description ?? "",
      );
      const signature = [
        resolvedCardId || "",
        resolvedAccountId || "",
        baseMapped.type,
        normalizedDescription,
        baseMapped.purchase_date || "",
        absoluteAmount.toFixed(2),
        category?.id || "",
        String(totalInstallments),
        (baseMapped.notes || "").trim().toLowerCase(),
      ].join("|");

      installmentGroupId = installmentGroupIdsBySignature.get(signature);

      if (!installmentGroupId) {
        installmentGroupId = crypto.randomUUID();
        installmentGroupIdsBySignature.set(signature, installmentGroupId);
      }
    }

    installmentNumbers.forEach((currentInstallmentNumber) => {
      const shiftedPurchaseDate = shiftInstallmentDate(
        baseMapped.purchase_date,
        currentInstallmentNumber,
      );
      const shiftedPaymentDate = shiftInstallmentDate(
        baseMapped.payment_date,
        currentInstallmentNumber,
      );

      normalizedTransactions.push({
        ...baseMapped,
        purchase_date: shiftedPurchaseDate,
        payment_date: shiftedPaymentDate,
        installment_group_id: installmentGroupId,
        installment_number:
          totalInstallments > 1 ? currentInstallmentNumber : undefined,
        total_installments:
          totalInstallments > 1 ? totalInstallments : undefined,
      });
    });
  });

  return { mappedData: parsedRows, validTransactions: normalizedTransactions };
};
