import { useRef } from 'react';
import { Check, Download, FileText, Upload } from 'lucide-react';
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  SelectMenu,
} from '@/shared/components/ui';
import { useTransactionImportLogic } from '../hooks/useTransactionImportLogic';
import { ImportPreviewTable } from './ImportPreviewTable';

interface TransactionImportModalProps {
  open: boolean;
  onClose: () => void;
}

const labelClass = 'font-mono text-[0.65rem] uppercase tracking-wider text-text-muted';

export function TransactionImportModal({ open, onClose }: TransactionImportModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const logic = useTransactionImportLogic(open, onClose);

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => (value ? undefined : logic.handleClose())}
      className="max-w-5xl"
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar Transações (CSV)</DialogTitle>
        </DialogHeader>

        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(event) => logic.handleFile(event.target.files?.[0])}
        />

        <div className="space-y-4">
          {logic.fileInfo ? (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-2 px-4 py-3">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-primary" />
                <div>
                  <p className="font-semibold text-text">{logic.fileInfo.name}</p>
                  <p className="text-xs text-text-muted">
                    {(logic.fileInfo.size / 1024).toFixed(1)} KB • {logic.fileInfo.lines} linhas
                  </p>
                </div>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => fileRef.current?.click()}>
                Trocar arquivo
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border-strong bg-bg/30 px-4 py-6 text-sm text-text-muted transition-colors hover:border-primary/50 hover:text-text"
            >
              <Upload size={18} />
              Selecionar arquivo CSV
            </button>
          )}

          {logic.fileInfo ? (
            <>
              <div className="rounded-lg border border-border bg-surface-2/40 p-3">
                <p className={`${labelClass} mb-2`}>Configurações globais da importação</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <SelectMenu
                    placeholder="Forma de pagamento"
                    options={logic.paymentMethodOptions}
                    value={logic.paymentMethodId}
                    onChange={(value) => logic.setPaymentMethodId(Number(value))}
                  />
                  <SelectMenu
                    placeholder="Conta"
                    options={logic.accountOptions}
                    value={logic.accountId}
                    onChange={(value) => logic.setAccountId(Number(value))}
                  />
                  <SelectMenu
                    placeholder={logic.isCreditMethod ? 'Selecione o cartão' : 'Só para crédito'}
                    disabled={!logic.isCreditMethod}
                    options={[{ value: 0, label: 'Sem cartão' }, ...logic.cardOptions]}
                    value={logic.cardId}
                    onChange={(value) => logic.setCardId(Number(value))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-text">Preview dos Dados</p>
                <Badge variant={logic.validCount === logic.rows.length ? 'income' : 'expense'}>
                  {logic.validCount} de {logic.rows.length} válidos
                </Badge>
              </div>

              {logic.rows.length > 0 ? (
                <ImportPreviewTable
                  rows={logic.rows}
                  categoryOptions={logic.categoryOptions}
                  onChange={logic.updateRow}
                  onRemove={logic.removeRow}
                />
              ) : (
                <p className="py-6 text-center text-sm text-text-muted">
                  Nenhuma linha válida no arquivo.
                </p>
              )}

              {logic.errors.length > 0 && (
                <div className="max-h-24 space-y-0.5 overflow-auto rounded-lg border border-expense/30 bg-expense/5 p-2 text-xs text-expense">
                  {logic.errors.slice(0, 8).map((error) => (
                    <p key={error}>{error}</p>
                  ))}
                  {logic.errors.length > 8 && <p>+{logic.errors.length - 8} erros…</p>}
                </div>
              )}

              {logic.importing && (
                <p className="text-center text-sm text-text-muted">
                  Importando… {logic.progress}/{logic.validCount}
                </p>
              )}
            </>
          ) : null}
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="secondary"
            onClick={logic.downloadTemplate}
            disabled={!logic.hasTemplate}
          >
            <Download size={14} />
            Baixar modelo
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={logic.handleClose} disabled={logic.importing}>
              Cancelar
            </Button>
            <Button type="button" onClick={logic.runImport} loading={logic.importing} disabled={!logic.canImport}>
              <Check size={16} />
              Importar {logic.validCount} {logic.validCount === 1 ? 'Transação' : 'Transações'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
