import { useState, useMemo } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Alert,
    Stack,
    CircularProgress,
    IconButton,
    TextField,
    Select,
    MenuItem,
    Tooltip
} from '@mui/material';
import { Upload, X, CheckCircle2, AlertCircle, FileText, Trash2 } from 'lucide-react';
import Papa from 'papaparse';
import { useAccounts } from '../../hooks/useAccounts';
import { useCategories } from '../../hooks/useCategories';
import { useCreditCards } from '../../hooks/useCreditCards';
import { useBatchCreateTransactions } from '../../hooks/useTransactions';

interface FileData {
    Data: string;
    Descrição: string;
    Valor: string;
    Categoria: string;
    Conta: string;
    Cartão?: string;
    'Forma de pagamento'?: string;
    'Data de pagamento'?: string;
    'Conta de pagamento'?: string;
    Notas: string;
}

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

    const parseDate = (dateStr: string) => {
        if (!dateStr) return null;

        // Try DD/MM/YYYY
        const brFormat = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (brFormat) {
            const [, day, month, year] = brFormat;
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }

        // Try YYYY-MM-DD (standard)
        const isoFormat = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
        if (isoFormat) return dateStr;

        return null; // Invalid format
    };

    const mappedData = useMemo(() => {
        if (!previewData.length || !accounts || !categories || !cards) return [];

        return previewData.map(row => {
            // Clean value: remove thousands separator (.) and replace decimal separator (,) with (.)
            const cleanedValue = row.Valor.replace(/\./g, '').replace(',', '.').trim();
            const amount = parseFloat(cleanedValue);

            // Auto-detect type: negative values are expenses, positive are income
            const type = amount >= 0 ? 'income' : 'expense';

            const purchaseDate = parseDate(row.Data);
            const paymentDateStr = row['Data de pagamento'];
            const paymentDate = parseDate(paymentDateStr || '');
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
                    purchase_date: purchaseDate,
                    payment_date: paymentDate || purchaseDate,
                    is_paid: isPaid,
                    is_fixed: false,
                    recurring_group_id: null,
                    installment_group_id: null,
                    installment_number: null,
                    account_id: account?.id || paymentAccount?.id,
                    card_id: card?.id,
                    category_id: category?.id,
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
                    <Stack spacing={2}>
                        <Box
                            component="label"
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                py: 8,
                                border: isDragOver ? '2px dashed #D4AF37' : '2px dashed #2A2A2A',
                                borderRadius: 2,
                                textAlign: 'center',
                                bgcolor: isDragOver ? 'rgba(212, 175, 55, 0.08)' : 'rgba(255,255,255,0.01)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    bgcolor: 'rgba(212, 175, 55, 0.05)',
                                    borderColor: 'primary.main',
                                    '& .upload-icon': { color: 'primary.main', opacity: 1 }
                                }
                            }}
                        >
                            <input type="file" accept=".csv" hidden onChange={handleFileChange} />
                            <Upload className="upload-icon" size={48} style={{ marginBottom: 16, opacity: 0.5, transition: 'all 0.2s' }} />
                            <Typography variant="h6">Selecione seu arquivo CSV</Typography>
                            <Typography color="text.secondary" variant="body2">ou arraste e solte aqui</Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Button
                                size="small"
                                variant="text"
                                startIcon={<FileText size={16} />}
                                onClick={handleDownloadTemplate}
                                sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                            >
                                Baixar modelo de CSV
                            </Button>
                        </Box>
                    </Stack>
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
                            <>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Preview dos Dados</Typography>
                                    <Chip
                                        label={`${totalValid} de ${mappedData.length} válidos`}
                                        color={totalValid === mappedData.length ? "success" : "warning"}
                                    />
                                </Box>
                                <TableContainer component={Paper} sx={{ maxHeight: 400, border: '1px solid #2A2A2A' }}>
                                    <Table stickyHeader size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ bgcolor: 'background.paper', fontSize: '0.75rem', fontWeight: 700 }}>Data</TableCell>
                                                <TableCell sx={{ bgcolor: 'background.paper', fontSize: '0.75rem', fontWeight: 700 }}>Descrição</TableCell>
                                                <TableCell sx={{ bgcolor: 'background.paper', fontSize: '0.75rem', fontWeight: 700 }}>Valor</TableCell>
                                                <TableCell sx={{ bgcolor: 'background.paper', fontSize: '0.75rem', fontWeight: 700 }}>Categoria</TableCell>
                                                <TableCell sx={{ bgcolor: 'background.paper', fontSize: '0.75rem', fontWeight: 700 }}>Conta / Cartão</TableCell>
                                                <TableCell sx={{ bgcolor: 'background.paper', fontSize: '0.75rem', fontWeight: 700 }}>Método</TableCell>
                                                <TableCell sx={{ bgcolor: 'background.paper', width: 40 }}></TableCell>
                                                <TableCell sx={{ bgcolor: 'background.paper', width: 40 }}></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {mappedData.map((row, idx) => (
                                                <TableRow key={idx} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                                                    <TableCell sx={{ p: 0.5 }}>
                                                        <TextField
                                                            size="small"
                                                            variant="standard"
                                                            value={row.original.Data}
                                                            onChange={(e) => updateRow(idx, 'Data', e.target.value)}
                                                            error={row.errors.date}
                                                            sx={{ input: { fontSize: '0.8rem' } }}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ p: 0.5 }}>
                                                        <TextField
                                                            size="small"
                                                            variant="standard"
                                                            fullWidth
                                                            value={row.original.Descrição}
                                                            onChange={(e) => updateRow(idx, 'Descrição', e.target.value)}
                                                            sx={{ input: { fontSize: '0.8rem' } }}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ p: 0.5, width: 90 }}>
                                                        <TextField
                                                            size="small"
                                                            variant="standard"
                                                            value={row.original.Valor}
                                                            onChange={(e) => updateRow(idx, 'Valor', e.target.value)}
                                                            error={row.errors.amount}
                                                            sx={{
                                                                input: {
                                                                    fontSize: '0.8rem',
                                                                    fontWeight: 700,
                                                                    color: row.mapped.type === 'income' ? 'success.main' : 'error.main'
                                                                }
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ p: 0.5, minWidth: 120 }}>
                                                        <Select
                                                            size="small"
                                                            variant="standard"
                                                            value={row.original.Categoria || ''}
                                                            onChange={(e) => updateRow(idx, 'Categoria', e.target.value)}
                                                            fullWidth
                                                            sx={{ fontSize: '0.8rem' }}
                                                        >
                                                            <MenuItem value="">Sem Categoria</MenuItem>
                                                            {categories?.filter(c => c.type === row.mapped.type).map(c => (
                                                                <MenuItem key={c.id} value={c.name} sx={{ fontSize: '0.8rem' }}>{c.name}</MenuItem>
                                                            ))}
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell sx={{ p: 0.5, minWidth: 140 }}>
                                                        <Select
                                                            size="small"
                                                            variant="standard"
                                                            value={row.original.Conta || row.original.Cartão || ''}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                const isCard = cards?.some(c => c.name === val);
                                                                if (isCard) {
                                                                    updateRow(idx, 'Cartão', val);
                                                                    updateRow(idx, 'Conta', '');
                                                                } else {
                                                                    updateRow(idx, 'Conta', val);
                                                                    updateRow(idx, 'Cartão', '');
                                                                }
                                                            }}
                                                            fullWidth
                                                            sx={{ fontSize: '0.8rem' }}
                                                            error={row.errors.entity}
                                                        >
                                                            <MenuItem disabled value="">Selecione...</MenuItem>
                                                            {accounts?.map(a => (
                                                                <MenuItem key={a.id} value={a.name} sx={{ fontSize: '0.8rem' }}>🏦 {a.name}</MenuItem>
                                                            ))}
                                                            {cards?.map(c => (
                                                                <MenuItem key={c.id} value={c.name} sx={{ fontSize: '0.8rem' }}>💳 {c.name}</MenuItem>
                                                            ))}
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell sx={{ p: 0.5, minWidth: 100 }}>
                                                        <Select
                                                            size="small"
                                                            variant="standard"
                                                            value={row.original['Forma de pagamento'] || ''}
                                                            onChange={(e) => updateRow(idx, 'Forma de pagamento', e.target.value)}
                                                            fullWidth
                                                            sx={{ fontSize: '0.8rem' }}
                                                        >
                                                            <MenuItem value="Pix">PIX</MenuItem>
                                                            <MenuItem value="Débito">Débito</MenuItem>
                                                            <MenuItem value="Crédito">Crédito</MenuItem>
                                                            <MenuItem value="Dinheiro">Dinheiro</MenuItem>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell sx={{ p: 0.5, width: 40 }} align="center">
                                                        {row.isValid ?
                                                            <Tooltip title="Válido"><CheckCircle2 size={16} color="#2E7D32" /></Tooltip> :
                                                            <Tooltip title="Verifique os campos em vermelho"><AlertCircle size={16} color="#D32F2F" /></Tooltip>
                                                        }
                                                    </TableCell>
                                                    <TableCell sx={{ p: 0.5, width: 40 }} align="center">
                                                        <IconButton size="small" onClick={() => removeRow(idx)} color="inherit" sx={{ opacity: 0.5, '&:hover': { opacity: 1, color: 'error.main' } }}>
                                                            <Trash2 size={16} />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </>
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

function Chip({ label, color }: { label: string, color: 'success' | 'warning' }) {
    return (
        <Box sx={{
            px: 1.5,
            py: 0.5,
            borderRadius: 5,
            fontSize: '0.75rem',
            fontWeight: 700,
            bgcolor: color === 'success' ? 'rgba(46, 125, 50, 0.1)' : 'rgba(237, 108, 2, 0.1)',
            color: color === 'success' ? 'success.main' : 'warning.main',
            border: '1px solid currentColor'
        }}>
            {label}
        </Box>
    );
}
