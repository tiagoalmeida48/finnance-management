import { Button } from "@/shared/components/ui/button";
import { FileText, Upload } from "lucide-react";
import { messages } from "@/shared/i18n/messages";
import { Container } from "@/shared/components/layout/Container";
import { Text } from "@/shared/components/ui/Text";

interface ImportTransactionsUploadAreaProps {
  isDragOver: boolean;
  onDrop: (event: React.DragEvent<HTMLElement>) => void;
  onDragOver: (event: React.DragEvent<HTMLElement>) => void;
  onDragLeave: (event: React.DragEvent<HTMLElement>) => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDownloadTemplate: () => void;
}

export function ImportTransactionsUploadArea({
  isDragOver,
  onDrop,
  onDragOver,
  onDragLeave,
  onFileChange,
  onDownloadTemplate,
}: ImportTransactionsUploadAreaProps) {
  const uploadMessages = messages.transactions.importUpload;

  return (
    <Container unstyled className="space-y-2">
      <label
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`group flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed py-8 text-center transition-all ${
          isDragOver
            ? "border-[var(--color-primary)] bg-[var(--overlay-primary-08)]"
            : "border-[var(--color-border)] bg-[var(--overlay-white-01)] hover:border-[var(--color-primary)] hover:bg-[var(--overlay-primary-05)]"
        }`}
      >
        <input type="file" accept=".csv" hidden onChange={onFileChange} />
        <Upload
          className="mb-4 opacity-50 transition-all group-hover:text-[var(--color-primary)] group-hover:opacity-100"
          size={48}
        />
        <h3 className="text-lg font-semibold">
          {uploadMessages.selectCsvTitle}
        </h3>
        <Text className="text-sm text-[var(--color-text-secondary)]">
          {uploadMessages.dragAndDropHint}
        </Text>
      </label>

      <Container unstyled className="flex justify-center">
        <Button
          size="small"
          variant="text"
          startIcon={<FileText size={16} />}
          onClick={onDownloadTemplate}
          className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
        >
          {uploadMessages.downloadTemplateButton}
        </Button>
      </Container>
    </Container>
  );
}
