import { useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    MenuItem,
    Select,
    Stack,
    Typography,
} from '@mui/material';
import { AlertCircle, CheckCircle2, FileText, X } from 'lucide-react';
import Papa from 'papaparse';
import { addMonths, format } from 'date-fns';
import { useAccounts } from '../../hooks/useAccounts';
import { useCategories } from '../../hooks/useCategories';
import { useCreditCards } from '../../hooks/useCreditCards';
import { useBatchCreateTransactions } from '../../hooks/useTransactions';
import type { Transaction, TransactionType } from '../../interfaces';
import { ImportTransactionsUploadArea } from './import/ImportTransactionsUploadArea';
import { ImportTransactionsPreviewTable } from './import/ImportTransactionsPreviewTable';
import type { FileData, ImportPreviewRow } from './import/importTransactions.types';
import {
    inferImportTransactionType,
    normalizeInstallmentDescriptionForGrouping,
    parseImportAmount,
    parseImportDate,
    parseImportInstallments,
} from './import/importTransactions.utils';

interface ImportTransactionsModalProps {
    open: boolean;
    onClose: () => void;
}

type ImportPaymentMethod = 'pix' | 'debit' | 'credit' | 'money';

const CSV_TEMPLATE_HEADERS = [
    'Data',
    'Descrição',
    'Valor',
    'Categoria',
    'Parcelas',
    'Data de pagamento',
    'Conta de pagamento',
    'Notas',
] as const;

const findByName = <T extends { name: string }>(items: T[] | undefined, targetName: string) => {
    const normalizedTargetName = targetName.trim().toLowerCase();
    if (!normalizedTargetName) return undefined;
    return items?.find((item) => item.name.trim().toLowerCase() === normalizedTargetName);
};

const normalizeCsvRow = (row: Record<string, string>): FileData => ({
    Data: row.Data || '',
    Descrição: row['Descrição'] || row.Descricao || '',
    Valor: row.Valor || '',
    Categoria: row.Categoria || '',
    Parcelas: row.Parcelas || '',
    'Data de pagamento': row['Data de pagamento'] || '',
    'Conta de pagamento': row['Conta de pagamento'] || '',
    Notas: row.Notas || '',
});

const getMissingColumns = (headers: string[]) =>
    CSV_TEMPLATE_HEADERS.filter((column) => {
        if (column === 'Descrição') {
            return !headers.includes('Descrição') && !headers.includes('Descricao');
        }
        return !headers.includes(column);
    });

const shiftInstallmentDate = (dateValue?: string, installmentNumber = 1) => {
    if (!dateValue) return undefined;

    const parsedDate = new Date(`${dateValue}T12:00:00`);
    if (Number.isNaN(parsedDate.getTime())) return dateValue;

    return format(addMonths(parsedDate, installmentNumber - 1), 'yyyy-MM-dd');
};

export function ImportTransactionsModal({ open, onClose }: ImportTransactionsModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<FileData[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<ImportPaymentMethod>('debit');
    const [selectedAccountId, setSelectedAccountId] = useState('');
    const [selectedCardId, setSelectedCardId] = useState('');

    const { data: accounts } = useAccounts();
    const { data: categories } = useCategories();
    const { data: cards } = useCreditCards();
    const batchCreate = useBatchCreateTransactions();

    const filteredCards = useMemo(() => {
        if (!cards) return [];
        if (!selectedAccountId) return cards;
        return cards.filter((card) => card.bank_account_id === selectedAccountId);
    }, [cards, selectedAccountId]);

    const parseCsvFile = (selectedFile: File) => {
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
                    setError(`O arquivo CSV deve conter as colunas: ${CSV_TEMPLATE_HEADERS.join(', ')}`);
                    setPreviewData([]);
                    return;
                }

                const rawRows = results.data as Record<string, string>[];
                if (!rawRows.length) {
                    setError('O arquivo CSV nao possui registros para importar.');
                    setPreviewData([]);
                    return;
                }

                const selectedAccountName = accounts?.find((account) => account.id === selectedAccountId)?.name || '';
                const normalizedRows = rawRows.map(normalizeCsvRow).map((row) => {
                    if (paymentMethod === 'credit') {
                        return {
                            ...row,
                            'Data de pagamento': '',
                            'Conta de pagamento': '',
                        };
                    }

                    if (selectedAccountName) {
                        return {
                            ...row,
                            'Conta de pagamento': selectedAccountName,
                        };
                    }

                    return row;
                });

                setPreviewData(normalizedRows);
            },
            error: (parseError) => {
                setError(`Erro ao processar o arquivo CSV: ${parseError.message}`);
                setPreviewData([]);
            },
        });
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) parseCsvFile(selectedFile);
    };

    const handleDrop = (event: React.DragEvent<HTMLElement>) => {
        event.preventDefault();
        setIsDragOver(false);

        const droppedFile = event.dataTransfer.files?.[0];
        if (!droppedFile) return;

        if (!droppedFile.name.toLowerCase().endsWith('.csv')) {
            setError('Selecione um arquivo no formato CSV (.csv).');
            return;
        }

        parseCsvFile(droppedFile);
    };

    const handleDragOver = (event: React.DragEvent<HTMLElement>) => {
        event.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLElement>) => {
        event.preventDefault();
        setIsDragOver(false);
    };

    const updateRow = (index: number, field: keyof FileData, value: string) => {
        setPreviewData((previousRows) =>
            previousRows.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)),
        );
    };

    const removeRow = (index: number) => {
        setPreviewData((previousRows) => previousRows.filter((_, rowIndex) => rowIndex !== index));
    };

    const { mappedData, validTransactions } = useMemo(() => {
        if (!previewData.length || !accounts || !categories || !cards) {
            return { mappedData: [] as ImportPreviewRow[], validTransactions: [] as Partial<Transaction>[] };
        }

        const selectedAccount = accounts.find((account) => account.id === selectedAccountId);
        const selectedCard = cards.find((card) => card.id === selectedCardId);

        const parsedRows: ImportPreviewRow[] = [];
        const normalizedTransactions: Partial<Transaction>[] = [];
        const installmentGroupIdsBySignature = new Map<string, string>();

        previewData.forEach((row) => {
            const amount = parseImportAmount(row.Valor || '');
            const amountIsInvalid = Number.isNaN(amount);
            const absoluteAmount = amountIsInvalid ? 0 : Math.abs(amount);
            const type: TransactionType = inferImportTransactionType(amount);

            const purchaseDate = parseImportDate(row.Data || '');
            const dateIsInvalid = !purchaseDate;

            const parsedInstallments = parseImportInstallments(row.Parcelas);
            const installmentsIsInvalid = !parsedInstallments;
            const installmentNumbers = parsedInstallments?.numbers || [1];
            const totalInstallments = parsedInstallments?.totalInstallments || 1;
            const installmentNumber = totalInstallments > 1 ? installmentNumbers[0] : undefined;

            const paymentDateRaw = row['Data de pagamento'] || '';
            const parsedPaymentDate = parseImportDate(paymentDateRaw);

            const paymentAccountByName = findByName(accounts, row['Conta de pagamento'] || '');
            const resolvedAccountId = paymentMethod === 'credit'
                ? selectedAccount?.id || selectedCard?.bank_account_id || undefined
                : selectedAccount?.id || paymentAccountByName?.id || undefined;

            const resolvedCardId = paymentMethod === 'credit' ? selectedCard?.id || undefined : undefined;
            const entityIsInvalid = paymentMethod === 'credit'
                ? !resolvedCardId || !resolvedAccountId
                : !resolvedAccountId;

            const category = findByName(categories, row.Categoria || '');

            const baseMapped: ImportPreviewRow['mapped'] = {
                description: row.Descrição || '',
                amount: absoluteAmount,
                type,
                purchase_date: purchaseDate || undefined,
                payment_date: paymentMethod === 'credit'
                    ? purchaseDate || undefined
                    : parsedPaymentDate || purchaseDate || undefined,
                is_paid: paymentMethod === 'credit' ? false : Boolean(parsedPaymentDate),
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

            const isValid = !amountIsInvalid && !dateIsInvalid && !entityIsInvalid && !installmentsIsInvalid;

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
                const normalizedDescription = normalizeInstallmentDescriptionForGrouping(baseMapped.description);
                const signature = [
                    resolvedCardId || '',
                    resolvedAccountId || '',
                    baseMapped.type,
                    normalizedDescription,
                    baseMapped.purchase_date || '',
                    absoluteAmount.toFixed(2),
                    category?.id || '',
                    String(totalInstallments),
                    (baseMapped.notes || '').trim().toLowerCase(),
                ].join('|');

                installmentGroupId = installmentGroupIdsBySignature.get(signature);

                if (!installmentGroupId) {
                    installmentGroupId = crypto.randomUUID();
                    installmentGroupIdsBySignature.set(signature, installmentGroupId);
                }
            }

            installmentNumbers.forEach((currentInstallmentNumber) => {
                const shiftedPurchaseDate = shiftInstallmentDate(baseMapped.purchase_date, currentInstallmentNumber);
                const shiftedPaymentDate = shiftInstallmentDate(baseMapped.payment_date, currentInstallmentNumber);

                normalizedTransactions.push({
                    ...baseMapped,
                    purchase_date: shiftedPurchaseDate,
                    payment_date: shiftedPaymentDate,
                    installment_group_id: installmentGroupId,
                    installment_number: totalInstallments > 1 ? currentInstallmentNumber : undefined,
                    total_installments: totalInstallments > 1 ? totalInstallments : undefined,
                });
            });
        });

        return { mappedData: parsedRows, validTransactions: normalizedTransactions };
    }, [previewData, accounts, categories, cards, paymentMethod, selectedAccountId, selectedCardId]);

    const handleImport = async () => {
        if (validTransactions.length === 0) return;

        try {
            await batchCreate.mutateAsync(validTransactions);
            handleClose();
        } catch {
            setError('Erro ao importar transacoes. Verifique os dados e tente novamente.');
        }
    };

    const handleClose = () => {
        setFile(null);
        setPreviewData([]);
        setError(null);
        setPaymentMethod('debit');
        setSelectedAccountId('');
        setSelectedCardId('');
        onClose();
    };

    const handleDownloadTemplate = () => {
        const csvContent = `\ufeff${CSV_TEMPLATE_HEADERS.join(';')}`;

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

    const totalValidRows = mappedData.filter((row) => row.isValid).length;
    const totalTransactionsToImport = validTransactions.length;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="md"
            slotProps={{
                paper: {
                    sx: {
                        maxHeight: '92vh',
                        overflow: 'hidden',
                    },
                },
            }}
        >
            <DialogTitle sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Importar Transacoes (CSV)
                <IconButton onClick={handleClose} size="small">
                    <X size={20} />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ overflowY: 'hidden' }}>
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
                                <Typography variant="caption" color="text.secondary">
                                    {(file.size / 1024).toFixed(1)} KB • {previewData.length} linhas
                                </Typography>
                            </Box>
                            <Button
                                size="small"
                                variant="text"
                                color="error"
                                onClick={() => {
                                    setFile(null);
                                    setPreviewData([]);
                                }}
                            >
                                Trocar arquivo
                            </Button>
                        </Box>

                        <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 1 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>
                                Configuracoes globais da importacao
                            </Typography>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                                <FormControl fullWidth size="small">
                                    <Select
                                        value={paymentMethod}
                                        onChange={(event) => {
                                            const nextMethod = event.target.value as ImportPaymentMethod;
                                            setPaymentMethod(nextMethod);

                                            if (nextMethod === 'credit') {
                                                setPreviewData((previousRows) =>
                                                    previousRows.map((row) => ({
                                                        ...row,
                                                        'Data de pagamento': '',
                                                        'Conta de pagamento': '',
                                                    })),
                                                );
                                                return;
                                            }

                                            const accountName = accounts?.find((account) => account.id === selectedAccountId)?.name || '';
                                            if (accountName) {
                                                setPreviewData((previousRows) =>
                                                    previousRows.map((row) => ({
                                                        ...row,
                                                        'Conta de pagamento': accountName,
                                                    })),
                                                );
                                            }
                                            setSelectedCardId('');
                                        }}
                                        displayEmpty
                                    >
                                        <MenuItem value="pix">PIX</MenuItem>
                                        <MenuItem value="debit">Debito</MenuItem>
                                        <MenuItem value="credit">Credito</MenuItem>
                                        <MenuItem value="money">Dinheiro</MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth size="small">
                                    <Select
                                        value={selectedAccountId}
                                        onChange={(event) => {
                                            const accountId = event.target.value;
                                            setSelectedAccountId(accountId);
                                            setSelectedCardId('');

                                            if (paymentMethod !== 'credit') {
                                                const accountName = accounts?.find((account) => account.id === accountId)?.name || '';
                                                setPreviewData((previousRows) =>
                                                    previousRows.map((row) => ({
                                                        ...row,
                                                        'Conta de pagamento': accountName,
                                                    })),
                                                );
                                            }
                                        }}
                                        displayEmpty
                                    >
                                        <MenuItem value="" disabled>
                                            Selecione a conta
                                        </MenuItem>
                                        {accounts?.map((account) => (
                                            <MenuItem key={account.id} value={account.id}>
                                                {account.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth size="small" disabled={paymentMethod !== 'credit'}>
                                    <Select
                                        value={selectedCardId}
                                        onChange={(event) => setSelectedCardId(event.target.value)}
                                        displayEmpty
                                    >
                                        <MenuItem value="" disabled>
                                            Selecione o cartao
                                        </MenuItem>
                                        {filteredCards.map((card) => (
                                            <MenuItem key={card.id} value={card.id}>
                                                {card.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Stack>

                            {paymentMethod === 'credit' && (
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                    Em credito, as colunas Data de pagamento e Conta de pagamento sao ignoradas.
                                </Typography>
                            )}
                        </Box>

                        {error && <Alert severity="error" icon={<AlertCircle size={20} />}>{error}</Alert>}

                        {previewData.length > 0 && (
                            <ImportTransactionsPreviewTable
                                mappedData={mappedData}
                                totalValid={totalValidRows}
                                categories={categories}
                                isCreditPayment={paymentMethod === 'credit'}
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
                    disabled={!file || totalTransactionsToImport === 0 || batchCreate.isPending}
                    startIcon={batchCreate.isPending ? <CircularProgress size={16} color="inherit" /> : <CheckCircle2 size={18} />}
                >
                    {batchCreate.isPending
                        ? 'Importando...'
                        : `Importar ${totalTransactionsToImport} Transacoes`}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
