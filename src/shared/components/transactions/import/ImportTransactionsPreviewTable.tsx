import { useMemo, useState } from 'react';
import {
    Box,
    IconButton,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import { AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';
import type { Category } from '@/shared/interfaces';
import type { FileData, ImportPreviewRow } from './importTransactions.types';

type ResizableColumnKey =
    | 'date'
    | 'description'
    | 'amount'
    | 'category'
    | 'installments'
    | 'paymentDate'
    | 'paymentAccount';

const DEFAULT_COLUMN_WIDTHS: Record<ResizableColumnKey, number> = {
    date: 115,
    description: 300,
    amount: 95,
    category: 150,
    installments: 95,
    paymentDate: 120,
    paymentAccount: 140,
};

const MIN_COLUMN_WIDTHS: Record<ResizableColumnKey, number> = {
    date: 90,
    description: 160,
    amount: 80,
    category: 120,
    installments: 80,
    paymentDate: 100,
    paymentAccount: 110,
};

interface ImportTransactionsPreviewTableProps {
    mappedData: ImportPreviewRow[];
    totalValid: number;
    categories?: Category[];
    isCreditPayment: boolean;
    updateRow: (index: number, field: keyof FileData, value: string) => void;
    removeRow: (index: number) => void;
}

export function ImportTransactionsPreviewTable({
    mappedData,
    totalValid,
    categories,
    isCreditPayment,
    updateRow,
    removeRow,
}: ImportTransactionsPreviewTableProps) {
    const [columnWidths, setColumnWidths] = useState<Record<ResizableColumnKey, number>>(DEFAULT_COLUMN_WIDTHS);

    const visibleColumns = useMemo(
        () => [
            { key: 'date' as const, label: 'Data' },
            { key: 'description' as const, label: 'Descricao' },
            { key: 'amount' as const, label: 'Valor' },
            { key: 'category' as const, label: 'Categoria' },
            { key: 'installments' as const, label: 'Parcelas' },
            ...(
                isCreditPayment
                    ? []
                    : [
                        { key: 'paymentDate' as const, label: 'Data pagamento' },
                        { key: 'paymentAccount' as const, label: 'Conta pagamento' },
                    ]
            ),
        ],
        [isCreditPayment],
    );

    const tableMinWidth = useMemo(
        () => visibleColumns.reduce((total, column) => total + columnWidths[column.key], 0) + 80,
        [visibleColumns, columnWidths],
    );

    const startResize = (columnKey: ResizableColumnKey, event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();

        const startX = event.clientX;
        const startWidth = columnWidths[columnKey];

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const delta = moveEvent.clientX - startX;
            const nextWidth = Math.max(MIN_COLUMN_WIDTHS[columnKey], Math.round(startWidth + delta));

            setColumnWidths((previousWidths) => {
                if (previousWidths[columnKey] === nextWidth) return previousWidths;
                return { ...previousWidths, [columnKey]: nextWidth };
            });
        };

        const finishResize = () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', finishResize, { once: true });
    };

    const headerCellSx = (columnKey: ResizableColumnKey) => ({
        bgcolor: 'background.paper',
        fontSize: '0.75rem',
        fontWeight: 700,
        width: columnWidths[columnKey],
        minWidth: columnWidths[columnKey],
        maxWidth: columnWidths[columnKey],
        position: 'relative',
        pr: 1.5,
    });

    const bodyCellSx = (columnKey: ResizableColumnKey) => ({
        p: 0.5,
        width: columnWidths[columnKey],
        minWidth: columnWidths[columnKey],
        maxWidth: columnWidths[columnKey],
    });

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Preview dos Dados
                </Typography>
                <ValidationChip
                    label={`${totalValid} de ${mappedData.length} válidos`}
                    color={totalValid === mappedData.length ? 'success' : 'warning'}
                />
            </Box>

            <TableContainer component={Paper} sx={{ maxHeight: 400, border: '1px solid #2A2A2A' }}>
                <Table stickyHeader size="small" sx={{ minWidth: tableMinWidth }}>
                    <TableHead>
                        <TableRow>
                            {visibleColumns.map((column) => (
                                <TableCell key={column.key} sx={headerCellSx(column.key)}>
                                    {column.label}
                                    <Box
                                        onMouseDown={(event) => startResize(column.key, event)}
                                        sx={{
                                            position: 'absolute',
                                            top: 0,
                                            right: 0,
                                            width: 8,
                                            height: '100%',
                                            cursor: 'col-resize',
                                            zIndex: 2,
                                            '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' },
                                        }}
                                    />
                                </TableCell>
                            ))}
                            <TableCell sx={{ bgcolor: 'background.paper', width: 40 }} />
                            <TableCell sx={{ bgcolor: 'background.paper', width: 40 }} />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {mappedData.map((row, idx) => (
                            <TableRow key={idx} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                                <TableCell sx={bodyCellSx('date')}>
                                    <TextField
                                        size="small"
                                        variant="standard"
                                        value={row.original.Data || ''}
                                        onChange={(event) => updateRow(idx, 'Data', event.target.value)}
                                        error={row.errors.date}
                                        sx={{ input: { fontSize: '0.8rem' } }}
                                    />
                                </TableCell>
                                <TableCell sx={bodyCellSx('description')}>
                                    <TextField
                                        size="small"
                                        variant="standard"
                                        fullWidth
                                        value={row.original.Descrição || ''}
                                        onChange={(event) => updateRow(idx, 'Descrição', event.target.value)}
                                        sx={{ input: { fontSize: '0.8rem' } }}
                                    />
                                </TableCell>
                                <TableCell sx={bodyCellSx('amount')}>
                                    <TextField
                                        size="small"
                                        variant="standard"
                                        value={row.original.Valor || ''}
                                        onChange={(event) => updateRow(idx, 'Valor', event.target.value)}
                                        error={row.errors.amount}
                                        sx={{
                                            input: {
                                                fontSize: '0.8rem',
                                                fontWeight: 700,
                                                color: row.mapped.type === 'income' ? 'success.main' : 'error.main',
                                            },
                                        }}
                                    />
                                </TableCell>
                                <TableCell sx={bodyCellSx('category')}>
                                    <Select
                                        size="small"
                                        variant="standard"
                                        value={row.original.Categoria || ''}
                                        onChange={(event) => updateRow(idx, 'Categoria', event.target.value)}
                                        fullWidth
                                        sx={{ fontSize: '0.8rem' }}
                                    >
                                        <MenuItem value="">Sem Categoria</MenuItem>
                                        {categories?.filter((category) => category.type === row.mapped.type).map((category) => (
                                            <MenuItem key={category.id} value={category.name} sx={{ fontSize: '0.8rem' }}>
                                                {category.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </TableCell>
                                <TableCell sx={bodyCellSx('installments')}>
                                    <TextField
                                        size="small"
                                        variant="standard"
                                        value={row.original.Parcelas || ''}
                                        onChange={(event) => updateRow(idx, 'Parcelas', event.target.value)}
                                        error={row.errors.installments}
                                        placeholder="Ex: 10 ou 8-10"
                                        sx={{ input: { fontSize: '0.8rem' } }}
                                    />
                                </TableCell>
                                {!isCreditPayment && (
                                    <TableCell sx={bodyCellSx('paymentDate')}>
                                        <TextField
                                            size="small"
                                            variant="standard"
                                            value={row.original['Data de pagamento'] || ''}
                                            onChange={(event) => updateRow(idx, 'Data de pagamento', event.target.value)}
                                            sx={{ input: { fontSize: '0.8rem' } }}
                                        />
                                    </TableCell>
                                )}
                                {!isCreditPayment && (
                                    <TableCell sx={bodyCellSx('paymentAccount')}>
                                        <TextField
                                            size="small"
                                            variant="standard"
                                            value={row.original['Conta de pagamento'] || ''}
                                            onChange={(event) => updateRow(idx, 'Conta de pagamento', event.target.value)}
                                            sx={{ input: { fontSize: '0.8rem' } }}
                                        />
                                    </TableCell>
                                )}
                                <TableCell sx={{ p: 0.5, width: 40 }} align="center">
                                    {row.isValid ? (
                                        <Tooltip title="Valido">
                                            <CheckCircle2 size={16} color="#2E7D32" />
                                        </Tooltip>
                                    ) : (
                                        <Tooltip title="Verifique os campos em vermelho">
                                            <AlertCircle size={16} color="#D32F2F" />
                                        </Tooltip>
                                    )}
                                </TableCell>
                                <TableCell sx={{ p: 0.5, width: 40 }} align="center">
                                    <IconButton
                                        size="small"
                                        onClick={() => removeRow(idx)}
                                        color="inherit"
                                        sx={{ opacity: 0.5, '&:hover': { opacity: 1, color: 'error.main' } }}
                                    >
                                        <Trash2 size={16} />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
}

function ValidationChip({ label, color }: { label: string; color: 'success' | 'warning' }) {
    return (
        <Box
            sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: 5,
                fontSize: '0.75rem',
                fontWeight: 700,
                bgcolor: color === 'success' ? 'rgba(46, 125, 50, 0.1)' : 'rgba(237, 108, 2, 0.1)',
                color: color === 'success' ? 'success.main' : 'warning.main',
                border: '1px solid currentColor',
            }}
        >
            {label}
        </Box>
    );
}
