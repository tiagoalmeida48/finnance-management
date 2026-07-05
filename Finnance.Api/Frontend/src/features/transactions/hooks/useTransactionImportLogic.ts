import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PaymentMethodId } from '@/config/constants';
import { entityOptionIcon } from '@/shared/components/ui';
import { useToast } from '@/shared/components/feedback';
import { transactionsService } from '../services/transactionsService';
import { downloadCsv } from '../components/transactionCsv';
import { transactionKeys } from './useTransactions';
import {
  useAccountsLookup,
  useCardsLookup,
  useCategoriesLookup,
  usePaymentMethodsLookup,
} from './useLookups';

export interface ImportRow {
  date: string;
  description: string;
  amount: number;
  transactionType: number;
  categoryId: number;
  installments: string;
  notes: string;
}

function isRowValid(row: ImportRow): boolean {
  return Boolean(row.description.trim()) && row.amount > 0 && Boolean(row.date);
}

export function useTransactionImportLogic(open: boolean, onClose: () => void) {
  const accounts = useAccountsLookup();
  const categories = useCategoriesLookup();
  const cards = useCardsLookup();
  const paymentMethods = usePaymentMethodsLookup();
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [rows, setRows] = useState<ImportRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number; lines: number } | null>(null);
  const [paymentMethodId, setPaymentMethodId] = useState<number>(PaymentMethodId.DEBIT);
  const [accountId, setAccountId] = useState<number>(0);
  const [cardId, setCardId] = useState<number>(0);
  const [importing, setImporting] = useState(false);

  const isCreditMethod = paymentMethodId === PaymentMethodId.CREDIT;

  const templateQuery = useQuery({
    queryKey: ['transactions', 'import-template'],
    queryFn: transactionsService.importTemplate,
    enabled: open,
  });

  const accountOptions = (accounts.data ?? []).map((a) => ({
    value: a.bankAccount,
    label: a.name,
    icon: entityOptionIcon(a.icon, a.color),
  }));
  const cardOptions = (cards.data ?? [])
    .filter((c) => !accountId || c.bankAccount === accountId)
    .map((c) => ({ value: c.creditCard, label: c.name, icon: entityOptionIcon('CreditCard', c.color) }));
  const paymentMethodOptions = (paymentMethods.data ?? []).map((p) => ({
    value: p.paymentMethod,
    label: p.name,
  }));
  const categoryOptions = (categories.data ?? []).map((c) => ({
    value: c.category,
    label: c.name,
    icon: entityOptionIcon(c.icon, c.color),
  }));

  const validCount = rows.filter(isRowValid).length;
  const canImport = accountId > 0 && validCount > 0 && !importing;

  const resetState = () => {
    setRows([]);
    setErrors([]);
    setFileInfo(null);
  };

  const handleClose = () => {
    if (importing) return;
    resetState();
    setCardId(0);
    onClose();
  };

  const handleFile = async (file?: File) => {
    if (!file) return;
    try {
      const text = await file.text();
      const result = await transactionsService.importPreview(text);
      if (!accountId) {
        const defaultAccount = accounts.data?.[0]?.bankAccount ?? 0;
        if (defaultAccount) setAccountId(defaultAccount);
      }
      setRows(
        result.rows.map((row) => ({
          date: row.date,
          description: row.description,
          amount: row.amount,
          transactionType: row.transactionType,
          categoryId: row.category ?? 0,
          installments: '',
          notes: row.notes,
        })),
      );
      setErrors(result.errors);
      setFileInfo({ name: file.name, size: file.size, lines: result.rows.length + result.errors.length });
    } catch {
      addToast('Não foi possível ler o arquivo.', 'error');
    }
  };

  const updatePaymentMethod = (value: number) => {
    setPaymentMethodId(value);
    if (value !== PaymentMethodId.CREDIT) setCardId(0);
  };

  const updateAccount = (value: number) => {
    setAccountId(value);
    setCardId(0);
  };

  const updateRow = (index: number, patch: Partial<ImportRow>) =>
    setRows((current) => current.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const removeRow = (index: number) => setRows((current) => current.filter((_, i) => i !== index));

  const runImport = async () => {
    if (!canImport) return;
    const valid = rows.filter(isRowValid);
    const onCard = isCreditMethod && cardId > 0;
    setImporting(true);
    try {
      const imported = await transactionsService.import({
        rows: valid.map((row) => ({
          date: row.date,
          description: row.description,
          amount: row.amount,
          transactionType: row.transactionType,
          category: row.categoryId || null,
          installments: Number.parseInt(row.installments, 10) || 0,
          notes: row.notes ?? '',
        })),
        paymentMethod: paymentMethodId || null,
        account: accountId,
        card: onCard ? cardId : null,
      });
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      addToast(`${imported} transações importadas.`, 'success');
      resetState();
      setCardId(0);
      onClose();
    } catch {
      addToast('Falha na importação. Nenhuma transação foi criada.', 'error');
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    if (templateQuery.data) downloadCsv(templateQuery.data, 'modelo_importacao_finance.csv');
  };

  return {
    rows,
    errors,
    fileInfo,
    paymentMethodId,
    setPaymentMethodId: updatePaymentMethod,
    accountId,
    setAccountId: updateAccount,
    cardId,
    setCardId,
    isCreditMethod,
    importing,
    validCount,
    canImport,
    hasTemplate: Boolean(templateQuery.data),
    accountOptions,
    cardOptions,
    paymentMethodOptions,
    categoryOptions,
    handleFile,
    updateRow,
    removeRow,
    runImport,
    handleClose,
    downloadTemplate,
  };
}
