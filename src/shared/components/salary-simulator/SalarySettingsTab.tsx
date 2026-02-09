import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Grid,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import { History } from 'lucide-react';
import type { SalarySetting } from '@/shared/interfaces';
import { colors } from '@/shared/theme';
import { formatCurrency, formatDateBR } from './salarySimulator.helpers';

interface SalarySettingsTabProps {
    loadingHistory: boolean;
    history: SalarySetting[];
    onOpenEdit: (setting: SalarySetting) => void;
    onOpenDeleteDialog: () => void;
    deletePending: boolean;
}

export function SalarySettingsTab({
    loadingHistory,
    history,
    onOpenEdit,
    onOpenDeleteDialog,
    deletePending,
}: SalarySettingsTabProps) {
    return (
        <Grid size={{ xs: 12 }}>
            <Card sx={{ borderRadius: '14px' }}>
                <CardContent sx={{ p: { xs: 2.25, md: 3 } }}>
                    <Stack spacing={1.8}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <History size={18} color={colors.accent} />
                            <Typography sx={{ fontWeight: 700, fontFamily: '"Plus Jakarta Sans"' }}>
                                Histórico de Configurações
                            </Typography>
                        </Stack>

                        {loadingHistory ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                <CircularProgress size={24} color="primary" />
                            </Box>
                        ) : (
                            <TableContainer sx={{ borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                                            <TableCell sx={headerCellSx}>Vigencia</TableCell>
                                            <TableCell align="right" sx={headerCellSx}>Valor/Hora</TableCell>
                                            <TableCell align="right" sx={headerCellSx}>Pro-Labore</TableCell>
                                            <TableCell align="right" sx={headerCellSx}>INSS %</TableCell>
                                            <TableCell align="right" sx={headerCellSx}>Taxa Adm %</TableCell>
                                            <TableCell align="center" sx={headerCellSx}>Status</TableCell>
                                            <TableCell align="center" sx={headerCellSx}>Acoes</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {history.map((setting) => {
                                            const isCurrent = setting.date_end === '9999-12-31';
                                            return (
                                                <TableRow
                                                    key={`${setting.user_id}-${setting.date_start}-${setting.date_end}`}
                                                    sx={{
                                                        bgcolor: isCurrent ? 'rgba(201, 168, 76, 0.08)' : 'transparent',
                                                        '&:hover': {
                                                            bgcolor: isCurrent ? 'rgba(201, 168, 76, 0.12)' : 'rgba(255,255,255,0.02)',
                                                        },
                                                    }}
                                                >
                                                    <TableCell sx={bodyCellSx}>
                                                        {formatDateBR(setting.date_start)} ate {formatDateBR(setting.date_end)}
                                                    </TableCell>
                                                    <TableCell align="right" sx={bodyCellSx}>
                                                        {formatCurrency(Number(setting.hourly_rate))}
                                                    </TableCell>
                                                    <TableCell align="right" sx={bodyCellSx}>
                                                        {formatCurrency(Number(setting.base_salary))}
                                                    </TableCell>
                                                    <TableCell align="right" sx={bodyCellSx}>
                                                        {Number(setting.inss_discount_percentage).toFixed(2)}
                                                    </TableCell>
                                                    <TableCell align="right" sx={bodyCellSx}>
                                                        {Number(setting.admin_fee_percentage).toFixed(2)}
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ py: 1.5 }}>
                                                        {isCurrent ? <Chip size="small" color="primary" label="Vigente" /> : '-'}
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ py: 1.5 }}>
                                                        <Stack direction="row" spacing={0.75} justifyContent="center">
                                                            <Button
                                                                size="small"
                                                                variant="text"
                                                                onClick={() => onOpenEdit(setting)}
                                                                sx={{ fontSize: '12px', minWidth: 0, px: 1 }}
                                                            >
                                                                Editar
                                                            </Button>
                                                            {isCurrent && (
                                                                <Button
                                                                    size="small"
                                                                    color="error"
                                                                    variant="outlined"
                                                                    onClick={onOpenDeleteDialog}
                                                                    disabled={deletePending}
                                                                    sx={{ fontSize: '12px', minWidth: 0, px: 1 }}
                                                                >
                                                                    Excluir
                                                                </Button>
                                                            )}
                                                        </Stack>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Stack>
                </CardContent>
            </Card>
        </Grid>
    );
}

const headerCellSx = {
    py: 1.5,
    fontSize: '11px',
    fontWeight: 600,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
};

const bodyCellSx = {
    color: colors.textSecondary,
    fontSize: '13px',
    py: 1.5,
};
