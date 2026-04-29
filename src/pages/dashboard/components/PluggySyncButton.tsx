import { useState, useEffect, useRef } from 'react';
import { RefreshCw, X, Building2, Trash2, CheckCircle2, Circle, MinusCircle, ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Container } from '@/shared/components/layout/Container';
import { Text } from '@/shared/components/ui/Text';
import { Input } from '@/shared/components/ui/input';
import { Select } from '@/shared/components/ui/select';
import { useAccounts } from '@/shared/hooks/api/useAccounts';
import { useCategories } from '@/shared/hooks/api/useCategories';
import { usePluggySync, type PluggyPreviewRow } from '@/shared/hooks/api/usePluggySync';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/shared/components/layout/Table';

type ColKey = 'data' | 'pagamento' | 'tipo' | 'descricao' | 'valor' | 'categoria' | 'parcelas';
type SortDir = 'asc' | 'desc';

const DEFAULT_COLS: ColKey[] = ['data', 'pagamento', 'tipo', 'descricao', 'valor', 'categoria', 'parcelas'];

const COL_LABEL: Record<ColKey, string> = {
  data: 'Data',
  pagamento: 'Pagamento',
  tipo: 'Tipo',
  descricao: 'Descrição',
  valor: 'Valor',
  categoria: 'Categoria',
  parcelas: 'Parcelas',
};

const SORTABLE: ColKey[] = ['data', 'descricao', 'valor', 'tipo', 'pagamento'];

function sortRows(rows: PluggyPreviewRow[], col: ColKey, dir: SortDir): PluggyPreviewRow[] {
  return [...rows].sort((a, b) => {
    let va: string | number = '';
    let vb: string | number = '';
    if (col === 'data') { va = a.paymentDate ?? ''; vb = b.paymentDate ?? ''; }
    else if (col === 'descricao') { va = a.description.toLowerCase(); vb = b.description.toLowerCase(); }
    else if (col === 'valor') { va = a.amount; vb = b.amount; }
    else if (col === 'tipo') { va = a.type; vb = b.type; }
    else if (col === 'pagamento') { va = a.isCredit ? 1 : 0; vb = b.isCredit ? 1 : 0; }
    if (va < vb) return dir === 'asc' ? -1 : 1;
    if (va > vb) return dir === 'asc' ? 1 : -1;
    return 0;
  });
}

export function PluggySyncButton() {
  const [open, setOpen] = useState(false);
  const [localAccountId, setLocalAccountId] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [columnOrder, setColumnOrder] = useState<ColKey[]>(DEFAULT_COLS);
  const [sortCol, setSortCol] = useState<ColKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const dragColRef = useRef<ColKey | null>(null);
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const { previewRows, setPreviewRows, fetchMutation, commitMutation } = usePluggySync();

  const pluggyAccounts = accounts.filter((a) => Boolean(a.pluggy_account_id));
  const selectedAccount = accounts.find((a) => a.id === localAccountId);
  const pluggyItemId = selectedAccount?.pluggy_account_id ?? '';
  const hasPluggyId = Boolean(pluggyItemId);
  const isPreviewMode = previewRows !== null;

  const outrasExpenseId = categories.find((c) => c.name === 'Outras' && c.type === 'expense')?.id ?? null;
  const outrasIncomeId = categories.find((c) => c.name === 'Outras' && c.type === 'income')?.id ?? null;

  useEffect(() => {
    if (!previewRows) return;
    setPreviewRows((prev) => {
      if (!prev) return prev;
      return prev.map((row) => {
        if (row.categoryId != null) return row;
        const fallback = row.type === 'expense' ? outrasExpenseId : outrasIncomeId;
        return fallback ? { ...row, categoryId: fallback } : row;
      });
    });
  }, [previewRows?.length, outrasExpenseId, outrasIncomeId]);

  const allSelected = previewRows != null && previewRows.length > 0 && selectedIds.size === previewRows.length;
  const someSelected = selectedIds.size > 0;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(previewRows?.map((_, i) => i) ?? []));
    }
  };

  const toggleSelect = (idx: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) { next.delete(idx); } else { next.add(idx); }
      return next;
    });
  };

  const removeSelected = () => {
    setPreviewRows((prev) => prev ? prev.filter((_, i) => !selectedIds.has(i)) : prev);
    setSelectedIds(new Set());
  };

  const handleClose = () => {
    setOpen(false);
    setLocalAccountId('');
    setPreviewRows(null);
    setSelectedIds(new Set());
  };

  const handleFetch = () => {
    if (!pluggyItemId || !localAccountId) return;
    fetchMutation.mutate({ pluggyItemId, localAccountId });
  };

  const handleCommit = () => {
    if (!previewRows?.length) return;
    commitMutation.mutate(previewRows);
  };

  const updateRow = (idx: number, field: keyof PluggyPreviewRow, value: string) => {
    setPreviewRows((prev) => {
      if (!prev) return prev;
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const removeRow = (idx: number) => {
    setPreviewRows((prev) => prev ? prev.filter((_, i) => i !== idx) : prev);
  };

  const handleSortClick = (col: ColKey) => {
    if (!SORTABLE.includes(col)) return;
    if (sortCol === col) {
      setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
    if (previewRows) {
      const nextDir = sortCol === col ? (sortDir === 'asc' ? 'desc' : 'asc') : 'asc';
      setPreviewRows(sortRows(previewRows, col, nextDir));
      setSelectedIds(new Set());
    }
  };

  const handleColDragStart = (col: ColKey) => { dragColRef.current = col; };
  const handleColDragOver = (e: React.DragEvent, col: ColKey) => {
    e.preventDefault();
    const from = dragColRef.current;
    if (!from || from === col) return;
    setColumnOrder((prev) => {
      const next = [...prev];
      const fromIdx = next.indexOf(from);
      const toIdx = next.indexOf(col);
      next.splice(fromIdx, 1);
      next.splice(toIdx, 0, from);
      return next;
    });
  };
  const handleColDragEnd = () => { dragColRef.current = null; };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<RefreshCw size={15} />}
        onClick={() => setOpen(true)}
      >
        Sincronizar dados bancários
      </Button>

      {open && (
        <div className="fixed top-0 bottom-0 right-0 left-[220px] z-[1100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Container
            unstyled
            className={`flex flex-col rounded-[18px] border border-[var(--color-border)] bg-[var(--color-card)] shadow-2xl transition-all ${
              isPreviewMode ? 'w-full h-full' : 'w-full max-w-md'
            }`}
          >
            <Container unstyled className="flex items-center justify-between p-6 pb-4 shrink-0">
              <Container unstyled className="flex items-center gap-2">
                <Building2 size={18} className="text-[var(--color-primary)]" />
                <Text className="text-base font-bold">Sincronizar dados bancários</Text>
                {isPreviewMode && previewRows.length > 0 && (
                  <span className="ml-2 rounded-full border border-[var(--color-primary)] px-2 py-0.5 text-xs font-bold text-[var(--color-primary)]">
                    {previewRows.length} transação(ões)
                  </span>
                )}
              </Container>
              <button
                onClick={handleClose}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                <X size={18} />
              </button>
            </Container>

            {!isPreviewMode && (
              <Container unstyled className="flex flex-col gap-4 px-6 pb-6">
                <Container unstyled className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[var(--color-text-secondary)]">
                    Conta bancária
                  </label>
                  <select
                    value={localAccountId}
                    onChange={(e) => setLocalAccountId(e.target.value)}
                    className="w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--overlay-white-03)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] appearance-none"
                  >
                    <option value="" style={{ background: '#14141e', color: '#f0f0f5' }}>
                      Selecione uma conta...
                    </option>
                    {pluggyAccounts.map((acc) => (
                      <option key={acc.id} value={acc.id} style={{ background: '#14141e', color: '#f0f0f5' }}>
                        {acc.name}
                      </option>
                    ))}
                  </select>

                  {pluggyAccounts.length === 0 && (
                    <Text className="text-xs text-[var(--color-error)] mt-1">
                      Nenhuma conta com Pluggy Item ID. Edite uma conta e preencha o campo "Pluggy Item ID".
                    </Text>
                  )}
                </Container>

                <Container unstyled className="flex gap-2 justify-end">
                  <Button variant="outlined" onClick={handleClose}>Cancelar</Button>
                  <Button
                    variant="contained"
                    onClick={handleFetch}
                    disabled={!hasPluggyId || !localAccountId || fetchMutation.isPending}
                    startIcon={fetchMutation.isPending ? undefined : <RefreshCw size={14} />}
                  >
                    {fetchMutation.isPending ? 'Buscando...' : 'Buscar transações'}
                  </Button>
                </Container>
              </Container>
            )}

            {isPreviewMode && (
              <>
                {previewRows.length === 0 ? (
                  <Container unstyled className="flex flex-col items-center gap-3 px-6 pb-6">
                    <CheckCircle2 size={40} className="text-[var(--color-success)]" />
                    <Text className="text-sm font-semibold">Nenhuma transação nova encontrada.</Text>
                    <Button variant="contained" onClick={handleClose}>Fechar</Button>
                  </Container>
                ) : (
                  <>
                    <Container
                      unstyled
                      className="flex-1 overflow-auto px-6"
                      style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.12) transparent' }}
                    >
                      <Container
                        unstyled
                        className="rounded-xl border border-[var(--color-border)] overflow-x-auto"
                      >
                        <Table className="w-full border-separate border-spacing-0 text-xs">
                          <TableHead className="sticky top-0 z-10 bg-[var(--color-card)]">
                            <TableRow>
                              <TableHeaderCell className="w-8 border-b border-[var(--color-border)] px-2 py-2">
                                <label className="relative flex items-center justify-center w-5 h-5 cursor-pointer group">
                                  <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={toggleSelectAll}
                                    className="absolute inset-0 z-10 w-full h-full cursor-pointer opacity-0"
                                  />
                                  {allSelected ? (
                                    <CheckCircle2 size={16} className="text-[var(--color-primary)] transition-colors" />
                                  ) : someSelected ? (
                                    <MinusCircle size={16} className="text-[var(--color-primary)] opacity-70 transition-colors" />
                                  ) : (
                                    <Circle size={16} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)] transition-colors" />
                                  )}
                                </label>
                              </TableHeaderCell>
                              {columnOrder.map((col) => {
                                const isSortable = SORTABLE.includes(col);
                                const isActive = sortCol === col;
                                return (
                                  <TableHeaderCell
                                    key={col}
                                    draggable
                                    onDragStart={() => handleColDragStart(col)}
                                    onDragOver={(e) => handleColDragOver(e, col)}
                                    onDragEnd={handleColDragEnd}
                                    className="border-b border-[var(--color-border)] px-2 py-2 text-left text-[11px] font-bold text-[var(--color-text-secondary)] whitespace-nowrap select-none"
                                  >
                                    <span className="inline-flex items-center gap-1">
                                      <GripVertical size={11} className="text-[var(--color-text-muted)] opacity-40 cursor-grab active:cursor-grabbing shrink-0" />
                                      {isSortable ? (
                                        <button
                                          onClick={() => handleSortClick(col)}
                                          className="inline-flex items-center gap-0.5 hover:text-[var(--color-text-primary)] transition-colors"
                                        >
                                          {COL_LABEL[col]}
                                          {isActive ? (
                                            sortDir === 'asc'
                                              ? <ChevronUp size={11} className="text-[var(--color-primary)]" />
                                              : <ChevronDown size={11} className="text-[var(--color-primary)]" />
                                          ) : (
                                            <ChevronUp size={11} className="opacity-20" />
                                          )}
                                        </button>
                                      ) : (
                                        <span>{COL_LABEL[col]}</span>
                                      )}
                                    </span>
                                  </TableHeaderCell>
                                );
                              })}
                              <TableHeaderCell className="w-8 border-b border-[var(--color-border)] p-0" />
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {previewRows.map((row, idx) => (
                              <TableRow key={idx} className={`hover:bg-white/5 ${selectedIds.has(idx) ? 'bg-white/[0.03]' : ''}`}>
                                <TableCell className="border-b border-[var(--color-border)] px-2 py-1 w-8">
                                  <label className="relative flex items-center justify-center w-5 h-5 cursor-pointer group">
                                    <input
                                      type="checkbox"
                                      checked={selectedIds.has(idx)}
                                      onChange={() => toggleSelect(idx)}
                                      className="absolute inset-0 z-10 w-full h-full cursor-pointer opacity-0"
                                    />
                                    {selectedIds.has(idx) ? (
                                      <CheckCircle2 size={16} className="text-[var(--color-primary)] transition-colors" />
                                    ) : (
                                      <Circle size={16} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)] transition-colors" />
                                    )}
                                  </label>
                                </TableCell>
                                {columnOrder.map((col) => {
                                  if (col === 'data') return (
                                    <TableCell key={col} className="border-b border-[var(--color-border)] p-1 w-[110px]">
                                      <span className="block px-2 py-1.5 text-xs text-[var(--color-text-secondary)]">
                                        {row.paymentDate ? row.paymentDate.split('-').reverse().join('/') : '—'}
                                      </span>
                                    </TableCell>
                                  );
                                  if (col === 'pagamento') return (
                                    <TableCell key={col} className="border-b border-[var(--color-border)] p-1 w-[110px]">
                                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${row.isCredit ? 'bg-[var(--overlay-secondary-10)] text-[var(--color-secondary)]' : 'bg-[var(--overlay-primary-08)] text-[var(--color-primary)]'}`}>
                                        {row.isCredit ? 'Cartão' : 'Débito'}
                                      </span>
                                    </TableCell>
                                  );
                                  if (col === 'tipo') return (
                                    <TableCell key={col} className="border-b border-[var(--color-border)] p-1 w-[100px]">
                                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${row.type === 'expense' ? 'bg-[var(--color-redBg)] text-[var(--color-error)]' : 'bg-[var(--color-greenBg)] text-[var(--color-success)]'}`}>
                                        {row.type === 'expense' ? 'Despesa' : 'Receita'}
                                      </span>
                                    </TableCell>
                                  );
                                  if (col === 'descricao') return (
                                    <TableCell key={col} className="border-b border-[var(--color-border)] p-1">
                                      <Input
                                        value={row.description}
                                        onChange={(e) => updateRow(idx, 'description', e.target.value)}
                                        className="h-8 text-xs w-full min-w-[180px]"
                                      />
                                    </TableCell>
                                  );
                                  if (col === 'valor') return (
                                    <TableCell key={col} className="border-b border-[var(--color-border)] p-1 w-[100px]">
                                      <span className={`block px-2 py-1.5 text-xs font-bold ${row.type === 'income' ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}>
                                        {row.amount}
                                      </span>
                                    </TableCell>
                                  );
                                  if (col === 'categoria') return (
                                    <TableCell key={col} className="border-b border-[var(--color-border)] p-1 w-[160px]">
                                      <Select
                                        value={row.categoryId ?? ''}
                                        onChange={(e) => updateRow(idx, 'categoryId', e.target.value)}
                                        className="h-8 text-xs"
                                      >
                                        <option value="" style={{ background: '#14141e', color: '#f0f0f5' }}>Sem categoria</option>
                                        {categories.filter((c) => c.type === row.type && c.is_active).map((c) => (
                                          <option key={c.id} value={c.id} style={{ background: '#14141e', color: '#f0f0f5' }}>{c.name}</option>
                                        ))}
                                      </Select>
                                    </TableCell>
                                  );
                                  if (col === 'parcelas') return (
                                    <TableCell key={col} className="border-b border-[var(--color-border)] p-1 w-[90px]">
                                      <InstallmentInput
                                        installmentNumber={row.installmentNumber}
                                        totalInstallments={row.totalInstallments}
                                        pluggyId={row.pluggyId}
                                        cardId={row.cardId}
                                        onChange={(installmentNumber, totalInstallments, installmentGroupId) => {
                                          setPreviewRows((prev) => {
                                            if (!prev) return prev;
                                            const next = [...prev];
                                            next[idx] = { ...next[idx], installmentNumber, totalInstallments, installmentGroupId };
                                            return next;
                                          });
                                        }}
                                      />
                                    </TableCell>
                                  );
                                  return null;
                                })}
                                <TableCell className="border-b border-[var(--color-border)] p-1 w-8 text-center">
                                  <button
                                    onClick={() => removeRow(idx)}
                                    className="opacity-50 hover:opacity-100 text-[var(--color-error)] transition-opacity"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Container>
                    </Container>

                    <Container unstyled className="flex gap-2 justify-end px-6 py-4 shrink-0 border-t border-[var(--color-border)]">
                      {someSelected && (
                        <Button
                          variant="outlined"
                          onClick={removeSelected}
                          startIcon={<Trash2 size={14} />}
                          className="text-[var(--color-error)] border-[var(--color-error)] hover:bg-[var(--color-redBg)]"
                        >
                          Remover {selectedIds.size} selecionada(s)
                        </Button>
                      )}
                      <Button variant="outlined" onClick={handleClose} disabled={commitMutation.isPending}>
                        Cancelar
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleCommit}
                        disabled={previewRows.length === 0 || commitMutation.isPending}
                      >
                        {commitMutation.isPending ? 'Gravando...' : `Gravar ${previewRows.length} transação(ões)`}
                      </Button>
                    </Container>
                  </>
                )}
              </>
            )}
          </Container>
        </div>
      )}
    </>
  );
}

function InstallmentInput({
  installmentNumber,
  totalInstallments,
  pluggyId,
  onChange,
}: {
  installmentNumber: number | null;
  totalInstallments: number | null;
  pluggyId: string;
  cardId?: string | null;
  onChange: (n: number | null, total: number | null, groupId: string | null) => void;
}) {
  const toRaw = (n: number | null, t: number | null) =>
    t && t > 1 ? `${n ?? 1}/${t}` : '';

  const [raw, setRaw] = useState(() => toRaw(installmentNumber, totalInstallments));

  useEffect(() => { setRaw(toRaw(installmentNumber, totalInstallments)); }, [installmentNumber, totalInstallments]);

  const handleBlur = () => {
    const trimmed = raw.trim();
    if (!trimmed) { onChange(null, null, null); return; }
    const match = trimmed.match(/^(\d+)\s*\/\s*(\d+)$/);
    if (match) {
      const cur = parseInt(match[1]);
      const tot = parseInt(match[2]);
      if (tot > 1) {
        onChange(cur, tot, `pluggy-group:${pluggyId}`);
        setRaw(`${cur}/${tot}`);
      } else {
        onChange(null, null, null);
        setRaw('');
      }
    } else {
      const single = parseInt(trimmed);
      if (!isNaN(single) && single > 1) {
        onChange(1, single, `pluggy-group:${pluggyId}`);
        setRaw(`1/${single}`);
      } else {
        onChange(null, null, null);
        setRaw('');
      }
    }
  };

  return (
    <Input
      value={raw}
      onChange={(e) => setRaw(e.target.value)}
      onBlur={handleBlur}
      placeholder="ex: 1/3"
      className="h-8 text-xs text-center"
    />
  );
}
