import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Select } from '@/shared/components/ui/select';
import { History } from 'lucide-react';
import type { SalarySetting } from '@/shared/interfaces';
import { colors } from '@/shared/theme';
import { formatDateBR, formatCurrency } from '../salarySimulator.helpers';
import { messages } from '@/shared/i18n/messages';
import { Container } from '@/shared/components/layout/Container';
import { Text } from '@/shared/components/ui/Text';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/shared/components/layout/Table';

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
  const tabMessages = messages.salarySimulator.settingsTab;
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const showingAllRows = rowsPerPage === -1;
  const maxPage = showingAllRows ? 0 : Math.max(0, Math.ceil(history.length / rowsPerPage) - 1);
  const safePage = Math.min(page, maxPage);

  const paginatedHistory = useMemo(() => {
    if (showingAllRows) {
      return history;
    }
    const startIndex = safePage * rowsPerPage;
    return history.slice(startIndex, startIndex + rowsPerPage);
  }, [history, safePage, rowsPerPage, showingAllRows]);

  const totalPages = rowsPerPage === -1 ? 1 : Math.max(1, Math.ceil(history.length / rowsPerPage));

  return (
    <Container unstyled className="col-span-12">
      <Card className="rounded-[14px]">
        <CardContent className="p-3">
          <Container unstyled className="flex flex-col gap-2">
            <Container unstyled className="flex items-center gap-2">
              <History size={18} color={colors.accent} />
              <Text className="font-heading font-bold">{tabMessages.title}</Text>
            </Container>

            {loadingHistory ? (
              <Container unstyled className="flex justify-center py-4">
                <Text
                  as="span"
                  className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-primary)] border-r-transparent"
                />
              </Container>
            ) : (
              <Container
                unstyled
                className="overflow-auto rounded-xl border border-[var(--color-border)]"
              >
                <Table className="w-full text-sm">
                  <TableHead>
                    <TableRow className="bg-[var(--overlay-white-02)]">
                      <TableHeaderCell className={headerCellClass}>
                        {tabMessages.columns.validity}
                      </TableHeaderCell>
                      <TableHeaderCell className={`${headerCellClass} text-right`}>
                        {tabMessages.columns.hourValue}
                      </TableHeaderCell>
                      <TableHeaderCell className={`${headerCellClass} text-right`}>
                        {tabMessages.columns.proLabore}
                      </TableHeaderCell>
                      <TableHeaderCell className={`${headerCellClass} text-right`}>
                        {tabMessages.columns.inss}
                      </TableHeaderCell>
                      <TableHeaderCell className={`${headerCellClass} text-right`}>
                        {tabMessages.columns.adminFee}
                      </TableHeaderCell>
                      <TableHeaderCell className={`${headerCellClass} text-center`}>
                        {tabMessages.columns.status}
                      </TableHeaderCell>
                      <TableHeaderCell className={`${headerCellClass} text-center`}>
                        {tabMessages.columns.actions}
                      </TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedHistory.map((setting) => {
                      const isCurrent = setting.date_end === '9999-12-31';
                      return (
                        <TableRow
                          key={`${setting.user_id}-${setting.date_start}-${setting.date_end}`}
                          className={`hover:bg-white/5 ${isCurrent ? 'bg-[var(--overlay-primary-08)]' : ''}`}
                        >
                          <TableCell className={bodyCellClass}>
                            {formatDateBR(setting.date_start)} ate {formatDateBR(setting.date_end)}
                          </TableCell>
                          <TableCell className={`${bodyCellClass} text-right`}>
                            {formatCurrency(Number(setting.hourly_rate))}
                          </TableCell>
                          <TableCell className={`${bodyCellClass} text-right`}>
                            {formatCurrency(Number(setting.base_salary))}
                          </TableCell>
                          <TableCell className={`${bodyCellClass} text-right`}>
                            {Number(setting.inss_discount_percentage).toFixed(2)}
                          </TableCell>
                          <TableCell className={`${bodyCellClass} text-right`}>
                            {Number(setting.admin_fee_percentage).toFixed(2)}
                          </TableCell>
                          <TableCell className="py-1.5 text-center">
                            {isCurrent ? (
                              <Text
                                as="span"
                                className="inline-flex rounded bg-[var(--color-primary)]/20 px-2 py-0.5 text-xs font-semibold text-[var(--color-primary)]"
                              >
                                {tabMessages.current}
                              </Text>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell className="py-1.5 text-center">
                            <Container unstyled className="flex justify-center gap-1">
                              <Button
                                size="small"
                                variant="text"
                                onClick={() => onOpenEdit(setting)}
                                className="text-xs"
                              >
                                {tabMessages.edit}
                              </Button>
                              {isCurrent && (
                                <Button
                                  size="small"
                                  color="error"
                                  variant="outlined"
                                  onClick={onOpenDeleteDialog}
                                  disabled={deletePending}
                                  className="text-xs"
                                >
                                  {tabMessages.delete}
                                </Button>
                              )}
                            </Container>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {paginatedHistory.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="py-3 text-center text-sm text-[var(--color-text-muted)]"
                        >
                          {tabMessages.empty}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Container>
            )}
            {!loadingHistory && (
              <Container
                unstyled
                className="flex flex-wrap items-center justify-between gap-2 text-sm text-[var(--color-text-secondary)]"
              >
                <Container unstyled className="flex items-center gap-2">
                  <Text as="span">{tabMessages.rowsPerPage}</Text>
                  <Select
                    value={String(rowsPerPage)}
                    onChange={(event) => {
                      setRowsPerPage(Number(event.target.value));
                      setPage(0);
                    }}
                    className="h-8 w-[110px] text-xs"
                  >
                    <option value="50">50</option>
                    <option value="100">100</option>
                    <option value="200">200</option>
                    <option value="300">300</option>
                    <option value="-1">{tabMessages.all}</option>
                  </Select>
                </Container>
                <Container unstyled className="flex items-center gap-2">
                  <Text as="span" className="text-xs">
                    {tabMessages.page(safePage + 1, totalPages)}
                  </Text>
                  <Button
                    type="button"
                    onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                    disabled={safePage <= 0}
                    className="rounded border border-[var(--color-border)] px-2 py-1 disabled:opacity-40"
                  >
                    {tabMessages.previous}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
                    disabled={safePage >= totalPages - 1}
                    className="rounded border border-[var(--color-border)] px-2 py-1 disabled:opacity-40"
                  >
                    {tabMessages.next}
                  </Button>
                </Container>
              </Container>
            )}
          </Container>
        </CardContent>
      </Card>
    </Container>
  );
}

const headerCellClass =
  'py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)]';
const bodyCellClass = 'py-1.5 text-[13px] text-[var(--color-text-secondary)]';
