import { useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Download, FileText, Upload } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  SelectMenu,
} from '@/shared/components/ui';
import { useToast } from '@/shared/components/feedback';
import { useAccountsLookup, useCategoriesLookup } from '../hooks/useLookups';
import { transactionKeys } from '../hooks/useTransactions';
import { transactionsService } from '../services/transactionsService';
import {
  CSV_TEMPLATE,
  downloadCsvTemplate,
  parseTransactionsCsv,
  type ParsedCsvRow,
} from './transactionCsv';

interface TransactionImportModalProps {
  open: boolean;
  onClose: () => void;
}

export function TransactionImportModal({ open, onClose }: TransactionImportModalProps) {
  const accounts = useAccountsLookup();
  const categories = useCategoriesLookup();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [rows, setRows] = useState<ParsedCsvRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [account, setAccount] = useState('');
  const [fileName, setFileName] = useState('');
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const accountOptions = (accounts.data ?? []).map((a) => ({
    value: a.bankAccount,
    label: a.name,
  }));

  const categoryByName = useMemo(() => {
    const map = new Map<string, number>();
    (categories.data ?? []).forEach((c) => map.set(c.name.trim().toLowerCase(), c.category));
    return map;
  }, [categories.data]);

  const resetState = () => {
    setRows([]);
    setErrors([]);
    setFileName('');
    setProgress(0);
  };

  const handleClose = () => {
    if (importing) return;
    resetState();
    setAccount('');
    onClose();
  };

  const handleFile = async (file?: File) => {
    if (!file) return;
    const text = await file.text();
    const result = parseTransactionsCsv(text);
    setRows(result.rows);
    setErrors(result.errors);
    setFileName(file.name);
    setProgress(0);
  };

  const runImport = async () => {
    if (!account || rows.length === 0) return;
    setImporting(true);
    let ok = 0;
    let failed = 0;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        await transactionsService.create({
          transactionType: row.transactionType,
          amount: row.amount,
          description: row.description,
          paymentDate: row.paymentDate,
          purchaseDate: null,
          account: Number(account),
          toAccount: null,
          card: null,
          category: row.categoryName
            ? categoryByName.get(row.categoryName.toLowerCase()) ?? null
            : null,
          paymentMethod: null,
          notes: '',
          isPaid: true,
          isFixed: false,
          isInstallment: false,
          totalInstallments: 1,
          repeatCount: 1,
          installmentAmounts: null,
          recurringGroup: null,
        });
        ok++;
      } catch {
        failed++;
      }
      setProgress(i + 1);
    }
    queryClient.invalidateQueries({ queryKey: transactionKeys.all });
    setImporting(false);
    const message =
      failed > 0
        ? `${ok} de ${rows.length} importadas · ${failed} com erro.`
        : `${ok} de ${rows.length} transações importadas.`;
    addToast(message, ok > 0 ? 'success' : 'error');
    resetState();
    setAccount('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(value) => (value ? undefined : handleClose())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar transações (CSV)</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-bg/40 px-3 py-2">
            <div className="flex items-start justify-between gap-3">
              <p className="font-mono text-xs text-text-muted">
                Colunas: <span className="text-primary">{CSV_TEMPLATE}</span>
                <br />
                tipo = receita ou despesa · valor com vírgula · data dd/mm/aaaa
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={downloadCsvTemplate}
                className="shrink-0"
              >
                <Download size={14} />
                Baixar modelo
              </Button>
            </div>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border-strong bg-bg/30 px-4 py-6 text-sm text-text-muted transition-colors hover:border-primary/50 hover:text-text"
          >
            {fileName ? <FileText size={18} /> : <Upload size={18} />}
            {fileName || 'Selecionar arquivo CSV'}
          </button>

          {(rows.length > 0 || errors.length > 0) && (
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-income">
                {rows.length} {rows.length === 1 ? 'transação válida' : 'transações válidas'}
              </p>
              {errors.length > 0 && (
                <div className="max-h-24 space-y-0.5 overflow-auto rounded-lg border border-expense/30 bg-expense/5 p-2 text-xs text-expense">
                  {errors.slice(0, 8).map((error) => (
                    <p key={error}>{error}</p>
                  ))}
                  {errors.length > 8 && <p>+{errors.length - 8} erros…</p>}
                </div>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="import-account">Conta de destino</Label>
            <SelectMenu
              id="import-account"
              placeholder="Selecione a conta"
              options={accountOptions}
              value={account}
              onChange={setAccount}
            />
          </div>

          {importing && (
            <p className="text-center text-sm text-text-muted">
              Importando… {progress}/{rows.length}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={handleClose} disabled={importing}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={runImport}
            loading={importing}
            disabled={!account || rows.length === 0}
          >
            Importar {rows.length > 0 ? rows.length : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
