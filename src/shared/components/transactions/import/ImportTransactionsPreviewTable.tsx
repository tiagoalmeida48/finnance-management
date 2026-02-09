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
import type { Account, Category, CreditCard } from '@/shared/interfaces';
import type { FileData, ImportPreviewRow } from './importTransactions.types';

interface ImportTransactionsPreviewTableProps {
    mappedData: ImportPreviewRow[];
    totalValid: number;
    categories?: Category[];
    accounts?: Account[];
    cards?: CreditCard[];
    updateRow: (index: number, field: keyof FileData, value: string) => void;
    removeRow: (index: number) => void;
}

export function ImportTransactionsPreviewTable({
    mappedData,
    totalValid,
    categories,
    accounts,
    cards,
    updateRow,
    removeRow,
}: ImportTransactionsPreviewTableProps) {
    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Preview dos Dados</Typography>
                <ValidationChip
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
                            <TableCell sx={{ bgcolor: 'background.paper', width: 40 }} />
                            <TableCell sx={{ bgcolor: 'background.paper', width: 40 }} />
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
                                            const value = e.target.value;
                                            const isCard = cards?.some(c => c.name === value);
                                            if (isCard) {
                                                updateRow(idx, 'Cartão', value);
                                                updateRow(idx, 'Conta', '');
                                            } else {
                                                updateRow(idx, 'Conta', value);
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
    );
}

function ValidationChip({ label, color }: { label: string; color: 'success' | 'warning' }) {
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
