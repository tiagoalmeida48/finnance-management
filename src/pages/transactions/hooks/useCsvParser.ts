import { useState, useCallback, type ChangeEvent, type DragEvent } from 'react';
import Papa from 'papaparse';
import { messages } from '@/shared/i18n/messages';

const importMessages = messages.transactions.import;
export const CSV_TEMPLATE_HEADERS = importMessages.csvTemplateHeaders;

export function useCsvParser<T>(
    normalizeRow: (rawRow: Record<string, string>) => T,
    transformRow?: (normalizedRow: T) => T
) {
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<T[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const getMissingColumns = useCallback((headers: string[]) =>
        CSV_TEMPLATE_HEADERS.filter((column) => {
            if (column === 'Descrição') {
                return !headers.includes('Descrição') && !headers.includes('Descricao');
            }
            return !headers.includes(column);
        }), []);

    const parseCsvFile = useCallback((selectedFile: File) => {
        setFile(selectedFile);
        setError(null);

        Papa.parse(selectedFile, {
            header: true,
            skipEmptyLines: true,
            delimiter: '',
            delimitersToGuess: [';', ',', '\t', '|'],
            complete: (results) => {
                const headers = (results.meta.fields || []) as string[];
                const missingColumns = getMissingColumns(headers);

                if (missingColumns.length > 0) {
                    setError(importMessages.errors.missingColumns([...CSV_TEMPLATE_HEADERS]));
                    setPreviewData([]);
                    return;
                }

                const rawRows = results.data as Record<string, string>[];
                if (!rawRows.length) {
                    setError(importMessages.errors.noRows);
                    setPreviewData([]);
                    return;
                }

                let normalizedRows = rawRows.map(normalizeRow);
                if (transformRow) {
                    normalizedRows = normalizedRows.map(transformRow);
                }

                setPreviewData(normalizedRows);
            },
            error: (parseError) => {
                setError(importMessages.errors.parseCsv(parseError.message));
                setPreviewData([]);
            },
        });
    }, [getMissingColumns, normalizeRow, transformRow]);

    const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) parseCsvFile(selectedFile);
    }, [parseCsvFile]);

    const handleDrop = useCallback((event: DragEvent<HTMLElement>) => {
        event.preventDefault();
        setIsDragOver(false);

        const droppedFile = event.dataTransfer.files?.[0];
        if (!droppedFile) return;

        if (!droppedFile.name.toLowerCase().endsWith('.csv')) {
            setError(importMessages.errors.invalidFileType);
            return;
        }

        parseCsvFile(droppedFile);
    }, [parseCsvFile]);

    const handleDragOver = useCallback((event: DragEvent<HTMLElement>) => {
        event.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((event: DragEvent<HTMLElement>) => {
        event.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDownloadTemplate = useCallback(() => {
        const csvContent = `\ufeff${CSV_TEMPLATE_HEADERS.join(';')}`;

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', importMessages.csvTemplateFilename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, []);

    const resetFile = useCallback(() => {
        setFile(null);
        setPreviewData([]);
        setError(null);
    }, []);

    return {
        file,
        previewData,
        setPreviewData,
        error,
        setError,
        isDragOver,
        handleFileChange,
        handleDrop,
        handleDragOver,
        handleDragLeave,
        handleDownloadTemplate,
        resetFile,
    };
}
