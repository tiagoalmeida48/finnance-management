import { useState, useMemo } from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    Typography,
} from '@mui/material';
import { AlertCircle, CheckCircle2, FileText, X } from 'lucide-react';
import Papa from 'papaparse';
import { useAccounts } from '../../hooks/useAccounts';
import { useCategories } from '../../hooks/useCategories';
import { useCreditCards } from '../../hooks/useCreditCards';
import { useBatchCreateTransactions } from '../../hooks/useTransactions';
import type { TransactionType } from '../../interfaces';
import { ImportTransactionsUploadArea } from './import/ImportTransactionsUploadArea';
import { ImportTransactionsPreviewTable } from './import/ImportTransactionsPreviewTable';
import type { FileData, ImportPreviewRow } from './import/importTransactions.types';
import { inferImportTransactionType, parseImportAmount, parseImportDate } from './import/importTransactions.utils';

interface ImportTransactionsModalProps {
    open: boolean;
    onClose: () => void;
}

export function ImportTransactionsModal({ open, onClose }: ImportTransactionsModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<FileData[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const { data: accounts } = useAccounts();
    const { data: categories } = useCategories();
    const { data: cards } = useCreditCards();
    const batchCreate = useBatchCreateTransactions();

    const parseCsvFile = (selectedFile: File) => {
        setFile(selectedFile);
        setError(null);

        Papa.parse(selectedFile, {
            header: true,
            skipEmptyLines: true,
            delimiter: '',
            delimitersToGuess: [';', ',', '\t', '|'],
            complete: (results) => {
                const data = results.data as FileData[];
                const requiredColumns = ['Data', 'Descrição', 'Valor', 'Conta'];
                const hasAllColumns = requiredColumns.every(col => col in (data[0] || {}));

                if (!hasAllColumns) {
                    setError(`O arquivo CSV deve conter as colunas: ${requiredColumns.join(', ')}`);
                    setPreviewData([]);
                    return;
                }

                setPreviewData(data);
            },
            error: (err) => {
                setError('Erro ao processar o arquivo CSV: ' + err.message);
                setPreviewData([]);
            }
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) parseCsvFile(selectedFile);
    };

    const handleDrop = (e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        setIsDragOver(false);

        const droppedFile = e.dataTransfer.files?.[0];
        if (!droppedFile) return;

        if (!droppedFile.name.toLowerCase().endsWith('.csv')) {
            setError('Selecione um arquivo no formato CSV (.csv).');
            return;
        }

        parseCsvFile(droppedFile);
    };

    const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const updateRow = (index: number, field: keyof FileData, value: string) => {
        setPreviewData(prev => prev.map((row, i) => i === index ? { ...row, [field]: value } : row));
    };

    const removeRow = (index: number) => {
        setPreviewData(prev => prev.filter((_, i) => i !== index));
    };

    const mappedData = useMemo<ImportPreviewRow[]>(() => {
        if (!previewData.length || !accounts || !categories || !cards) return [];

        return previewData.map(row => {
            const amount = parseImportAmount(row.Valor);
            const type: TransactionType = inferImportTransactionType(amount);

            const purchaseDate = parseImportDate(row.Data);
            const paymentDateStr = row['Data de pagamento'];
            const paymentDate = parseImportDate(paymentDateStr || '');
            const isPaid = !!paymentDateStr;

            // Payment method mapping
            const rawMethod = row['Forma de pagamento']?.toLowerCase() || '';
            const paymentMethod = rawMethod.includes('crédito') || !!row.Cartão ? 'credit' :
                rawMethod.includes('pix') ? 'pix' :
                    rawMethod.includes('dinheiro') ? 'money' : 'debit';

            // Find matching entities
            const primaryAccountName = row.Conta || '';
            const cardName = row.Cartão || '';
            const paymentAccountName = row['Conta de pagamento'] || primaryAccountName;

            const account = accounts?.find(a => a.name.toLowerCase() === primaryAccountName.toLowerCase());
            const paymentAccount = accounts?.find(a => a.name.toLowerCase() === paymentAccountName.toLowerCase());
            const card = cards?.find(c => c.name.toLowerCase() === cardName.toLowerCase());
            const category = categories?.find(c => c.name.toLowerCase() === row.Categoria?.toLowerCase());

            const isMissingEntity = !account && !card;
            const isMissingTransferEntity = false;

            return {
                original: row,
                mapped: {
                    description: row.Descrição,
                    amount: Math.abs(amount),
                    type,
                    purchase_date: purchaseDate || undefined,
                    payment_date: paymentDate || purchaseDate || undefined,
                    is_paid: isPaid,
                    is_fixed: false,
                    recurring_group_id: undefined,
                    installment_group_id: undefined,
                    installment_number: undefined,
                    account_id: account?.id || paymentAccount?.id,
                    card_id: card?.id || undefined,
                    category_id: category?.id || undefined,
                    payment_method: paymentMethod,
                    notes: row.Notas,
                },
                isValid: !isNaN(amount) && !!purchaseDate && (!isMissingEntity && !isMissingTransferEntity),
                errors: {
                    amount: isNaN(amount),
                    date: !purchaseDate,
                    entity: isMissingEntity || isMissingTransferEntity
                }
            };
        });
    }, [previewData, accounts, categories, cards]);

    const handleImport = async () => {
        const validTransactions = mappedData
            .filter(d => d.isValid)
            .map(d => d.mapped);

        if (validTransactions.length === 0) return;

        try {
            await batchCreate.mutateAsync(validTransactions);
            handleClose();
        } catch {
            setError('Erro ao importar transações. Verifique os dados e tente novamente.');
        }
    };

    const handleClose = () => {
        setFile(null);
        setPreviewData([]);
        setError(null);
        onClose();
    };

    const handleDownloadTemplate = () => {
        const headers = ['Data', 'Descrição', 'Valor', 'Categoria', 'Conta', 'Cartão', 'Forma de pagamento', 'Data de pagamento', 'Conta de pagamento', 'Notas'];
        const sample = ['2026-02-01', 'Almoço Executivo', '-45.90', 'Alimentação', 'Conta Corrente', '', 'Débito', '2026-02-01', '', 'Almoço de trabalho'];
        const sample2 = ['2026-02-02', 'Salário Mensal', '5000.00', 'Salário', 'Conta Corrente', '', 'PIX', '2026-02-02', '', ''];
        const csvContent = "\ufeff" + [headers, sample, sample2].map(e => e.join(';')).join('\n'); // Using semicolon for Brazilian Excel compatibility

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'modelo_importacao_finance.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const totalValid = mappedData.filter(d => d.isValid).length;

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Importar Transações (CSV)
                <IconButton onClick={handleClose} size="small"><X size={20} /></IconButton>
            </DialogTitle>

            <DialogContent>
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
                    <Stack spacing={3}>
                        <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <FileText size={24} color="#D4AF37" />
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{file.name}</Typography>
                                <Typography variant="caption" color="text.secondary">{(file.size / 1024).toFixed(1)} KB • {previewData.length} linhas</Typography>
                            </Box>
                            <Button size="small" variant="text" color="error" onClick={() => { setFile(null); setPreviewData([]); }}>Trocar arquivo</Button>
                        </Box>

                        {error && <Alert severity="error" icon={<AlertCircle size={20} />}>{error}</Alert>}

                        {previewData.length > 0 && (
                            <ImportTransactionsPreviewTable
                                mappedData={mappedData}
                                totalValid={totalValid}
                                categories={categories}
                                accounts={accounts}
                                cards={cards}
                                updateRow={updateRow}
                                removeRow={removeRow}
                            />
                        )}
                    </Stack>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 3 }}>
                <Button onClick={handleClose} color="inherit">Cancelar</Button>
                <Button
                    variant="contained"
                    onClick={handleImport}
                    disabled={!file || totalValid === 0 || batchCreate.isPending}
                    startIcon={batchCreate.isPending ? <CircularProgress size={16} color="inherit" /> : <CheckCircle2 size={18} />}
                >
                    {batchCreate.isPending ? 'Importando...' : `Importar ${totalValid} Transações`}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
