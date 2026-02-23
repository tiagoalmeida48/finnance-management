import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { IconButton } from "@/shared/components/ui/icon-button";
import { Button } from "@/shared/components/ui/button";
import { Select } from "@/shared/components/ui/select";
import { AlertCircle, CheckCircle2, FileText, X } from "lucide-react";
import { ImportTransactionsUploadArea } from "./import/ImportTransactionsUploadArea";
import { ImportTransactionsPreviewTable } from "./import/ImportTransactionsPreviewTable";
import { useImportTransactionsModalLogic } from "./import/useImportTransactionsModalLogic";
import type { ImportPaymentMethod } from "./import/useImportTransactionsModalLogic";
import { messages } from "@/shared/i18n/messages";
import { Container } from "@/shared/components/layout/Container";
import { Text } from "@/shared/components/ui/Text";

interface ImportTransactionsModalProps {
  open: boolean;
  onClose: () => void;
}

export function ImportTransactionsModal({
  open,
  onClose,
}: ImportTransactionsModalProps) {
  const commonMessages = messages.common;
  const importMessages = messages.transactions.import;

  const {
    file,
    previewData,
    error,
    isDragOver,
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
    handleFileChange,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    updateRow,
    removeRow,
    handlePaymentMethodChange,
    handleAccountChange,
    handleCardChange,
    handleResetFile,
    handleImport,
    handleClose,
    handleDownloadTemplate,
  } = useImportTransactionsModalLogic(onClose);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xl"
      className="max-h-[92vh] overflow-hidden"
    >
      <DialogTitle className="flex items-center justify-between">
        <Text as="span" className="font-bold">
          {importMessages.title}
        </Text>
        <IconButton onClick={handleClose} size="small">
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent className="overflow-y-hidden">
        {!file ? (
          <ImportTransactionsUploadArea
            isDragOver={isDragOver}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onFileChange={handleFileChange}
            onDownloadTemplate={handleDownloadTemplate}
          />
        ) : (
          <Container unstyled className="flex flex-col gap-3">
            <Container
              unstyled
              className="flex items-center gap-2 rounded-md bg-white/5 p-2"
            >
              <FileText size={24} color="var(--color-primary)" />
              <Container unstyled className="flex-1">
                <Text className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {file.name}
                </Text>
                <Text className="text-xs text-[var(--color-text-secondary)]">
                  {importMessages.fileSummary(
                    (file.size / 1024).toFixed(1),
                    previewData.length,
                  )}
                </Text>
              </Container>
              <Button
                size="small"
                variant="text"
                color="error"
                onClick={handleResetFile}
              >
                {importMessages.changeFileButton}
              </Button>
            </Container>

            <Container unstyled className="rounded-md bg-white/5 p-2">
              <Text className="mb-2 text-sm font-bold text-[var(--color-text-primary)]">
                {importMessages.globalConfigTitle}
              </Text>
              <Container unstyled className="grid gap-2 md:grid-cols-3">
                <Select
                  value={paymentMethod}
                  onChange={(event) => {
                    handlePaymentMethodChange(
                      event.target.value as ImportPaymentMethod,
                    );
                  }}
                >
                  <option value="pix">{importMessages.paymentMethodPix}</option>
                  <option value="debit">
                    {importMessages.paymentMethodDebit}
                  </option>
                  <option value="credit">
                    {importMessages.paymentMethodCredit}
                  </option>
                  <option value="money">
                    {importMessages.paymentMethodMoney}
                  </option>
                </Select>

                <Select
                  value={selectedAccountId}
                  onChange={(event) => {
                    handleAccountChange(event.target.value);
                  }}
                >
                  <option value="" disabled>
                    {importMessages.accountPlaceholder}
                  </option>
                  {accounts?.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </Select>

                <Select
                  value={selectedCardId}
                  onChange={(event) => handleCardChange(event.target.value)}
                  disabled={paymentMethod !== "credit"}
                >
                  <option value="" disabled>
                    {importMessages.cardPlaceholder}
                  </option>
                  {filteredCards.map((card) => (
                    <option key={card.id} value={card.id}>
                      {card.name}
                    </option>
                  ))}
                </Select>
              </Container>

              {paymentMethod === "credit" && (
                <Text className="mt-1 text-xs text-[var(--color-text-secondary)]">
                  {importMessages.creditHint}
                </Text>
              )}
            </Container>

            {error && (
              <Container
                unstyled
                className="flex items-center gap-2 rounded-md border border-[var(--color-error)]/40 bg-[var(--color-error)]/10 p-2 text-sm text-[var(--color-error)]"
              >
                <AlertCircle size={20} />
                {error}
              </Container>
            )}

            {previewData.length > 0 && (
              <ImportTransactionsPreviewTable
                mappedData={mappedData}
                totalValid={totalValidRows}
                categories={categories}
                isCreditPayment={paymentMethod === "credit"}
                updateRow={updateRow}
                removeRow={removeRow}
              />
            )}
          </Container>
        )}
      </DialogContent>

      <DialogActions className="p-6">
        <Button onClick={handleClose} color="inherit" variant="ghost">
          {commonMessages.actions.cancel}
        </Button>
        <Button
          variant="contained"
          onClick={handleImport}
          disabled={
            !file || totalTransactionsToImport === 0 || batchCreate.isPending
          }
          startIcon={
            batchCreate.isPending ? (
              <Text
                as="span"
                className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
              />
            ) : (
              <CheckCircle2 size={18} />
            )
          }
        >
          {batchCreate.isPending
            ? commonMessages.states.importing
            : importMessages.importButton(totalTransactionsToImport)}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
