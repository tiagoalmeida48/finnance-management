import { useMemo, useState, useCallback } from "react";
import { useAccounts } from "@/shared/hooks/api/useAccounts";
import { useCategories } from "@/shared/hooks/api/useCategories";
import { useCreditCards } from "@/shared/hooks/api/useCreditCards";
import { useBatchCreateTransactions } from "@/shared/hooks/api/useTransactions";
import { messages } from "@/shared/i18n/messages";
import type { FileData } from "./importTransactions.types";
import { validateAndMapImportData } from "@/shared/services/transactions-import.service";
import { useCsvParser } from "../../../hooks/useCsvParser";

export type ImportPaymentMethod = "pix" | "debit" | "credit" | "money";

const importMessages = messages.transactions.import;

const normalizeCsvRow = (row: Record<string, string>): FileData => ({
  Data: row.Data || "",
  Descrição: row["Descrição"] || row.Descricao || "",
  Valor: row.Valor || "",
  Categoria: row.Categoria || "",
  Parcelas: row.Parcelas || "",
  "Data de pagamento": row["Data de pagamento"] || "",
  "Conta de pagamento": row["Conta de pagamento"] || "",
  Notas: row.Notas || "",
});

const getAccountNameById = (
  accounts: Array<{ id: string; name: string }> | undefined,
  accountId: string,
) => accounts?.find((account) => account.id === accountId)?.name || "";

export function useImportTransactionsModalLogic(onClose: () => void) {
  const [paymentMethod, setPaymentMethod] =
    useState<ImportPaymentMethod>("debit");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [selectedCardId, setSelectedCardId] = useState("");

  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();
  const { data: cards } = useCreditCards();
  const batchCreate = useBatchCreateTransactions();

  const filteredCards = useMemo(() => {
    if (!cards) return [];
    if (!selectedAccountId) return cards;
    return cards.filter((card) => card.bank_account_id === selectedAccountId);
  }, [cards, selectedAccountId]);

  const transformRow = useCallback(
    (row: FileData): FileData => {
      if (paymentMethod === "credit") {
        return {
          ...row,
          "Data de pagamento": "",
          "Conta de pagamento": "",
        };
      }

      const selectedAccountName = getAccountNameById(
        accounts,
        selectedAccountId,
      );
      if (selectedAccountName) {
        return {
          ...row,
          "Conta de pagamento": selectedAccountName,
        };
      }

      return row;
    },
    [paymentMethod, accounts, selectedAccountId],
  );

  const parser = useCsvParser<FileData>(normalizeCsvRow, transformRow);
  const { setPreviewData, setError, resetFile } = parser;

  const updateRow = useCallback(
    (index: number, field: keyof FileData, value: string) => {
      setPreviewData((previousRows) =>
        previousRows.map((row, rowIndex) =>
          rowIndex === index ? { ...row, [field]: value } : row,
        ),
      );
    },
    [setPreviewData],
  );

  const removeRow = useCallback(
    (index: number) => {
      setPreviewData((previousRows) =>
        previousRows.filter((_, rowIndex) => rowIndex !== index),
      );
    },
    [setPreviewData],
  );

  const handlePaymentMethodChange = useCallback(
    (nextMethod: ImportPaymentMethod) => {
      setPaymentMethod(nextMethod);

      if (nextMethod === "credit") {
        setPreviewData((previousRows) =>
          previousRows.map((row) => ({
            ...row,
            "Data de pagamento": "",
            "Conta de pagamento": "",
          })),
        );
        return;
      }

      const accountName = getAccountNameById(accounts, selectedAccountId);
      if (accountName) {
        setPreviewData((previousRows) =>
          previousRows.map((row) => ({
            ...row,
            "Conta de pagamento": accountName,
          })),
        );
      }
      setSelectedCardId("");
    },
    [accounts, selectedAccountId, setPreviewData],
  );

  const handleAccountChange = useCallback(
    (accountId: string) => {
      setSelectedAccountId(accountId);
      setSelectedCardId("");

      if (paymentMethod !== "credit") {
        const accountName = getAccountNameById(accounts, accountId);
        setPreviewData((previousRows) =>
          previousRows.map((row) => ({
            ...row,
            "Conta de pagamento": accountName,
          })),
        );
      }
    },
    [accounts, paymentMethod, setPreviewData],
  );

  const handleCardChange = useCallback((cardId: string) => {
    setSelectedCardId(cardId);
  }, []);

  const { mappedData, validTransactions } = useMemo(() => {
    return validateAndMapImportData(
      parser.previewData,
      accounts || [],
      categories || [],
      cards || [],
      paymentMethod,
      selectedAccountId,
      selectedCardId,
    );
  }, [
    parser.previewData,
    accounts,
    categories,
    cards,
    paymentMethod,
    selectedAccountId,
    selectedCardId,
  ]);

  const handleClose = useCallback(() => {
    resetFile();
    setPaymentMethod("debit");
    setSelectedAccountId("");
    setSelectedCardId("");
    onClose();
  }, [resetFile, onClose]);

  const handleImport = useCallback(async () => {
    if (validTransactions.length === 0) return;

    try {
      await batchCreate.mutateAsync(validTransactions);
      handleClose();
    } catch {
      setError(importMessages.errors.importFailed);
    }
  }, [validTransactions, batchCreate, handleClose, setError]);

  const totalValidRows = mappedData.filter((row) => row.isValid).length;
  const totalTransactionsToImport = validTransactions.length;

  return {
    file: parser.file,
    previewData: parser.previewData,
    error: parser.error,
    isDragOver: parser.isDragOver,
    paymentMethod,
    selectedAccountId,
    selectedCardId,
    filteredCards,
    categories,
    accounts,
    mappedData,
    batchCreate,
    totalValidRows,
    totalTransactionsToImport,
    handleFileChange: parser.handleFileChange,
    handleDrop: parser.handleDrop,
    handleDragOver: parser.handleDragOver,
    handleDragLeave: parser.handleDragLeave,
    updateRow,
    removeRow,
    handlePaymentMethodChange,
    handleAccountChange,
    handleCardChange,
    handleResetFile: parser.resetFile,
    handleImport,
    handleClose,
    handleDownloadTemplate: parser.handleDownloadTemplate,
  };
}
