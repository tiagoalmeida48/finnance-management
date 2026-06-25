import { useState } from 'react';
import { CalendarRange, Plus, RefreshCw } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Spinner,
} from '@/shared/components/ui';
import { formatDate } from '@/shared/utils';
import { useCardCyclesLogic } from '../hooks/useCardCyclesLogic';
import { useReprocessInvoices } from '../hooks/useCardCycles';
import { CardCycleForm } from './CardCycleForm';
import type { StatementCycle } from '../types/cards.types';

interface CardCyclesModalProps {
  card: number;
  cardName: string;
  fallbackClosingDay: number;
  fallbackDueDay: number;
  open: boolean;
  onClose: () => void;
}

export function CardCyclesModal({
  card,
  cardName,
  fallbackClosingDay,
  fallbackDueDay,
  open,
  onClose,
}: CardCyclesModalProps) {
  const logic = useCardCyclesLogic(card, fallbackClosingDay, fallbackDueDay);
  const [reprocessOpen, setReprocessOpen] = useState(false);

  return (
    <>
      <Dialog open={open && logic.mode === null} onOpenChange={(value) => !value && onClose()}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <CalendarRange size={18} className="text-primary" />
              <div>
                <DialogTitle>Ciclos de faturamento</DialogTitle>
                <p className="text-xs text-text-muted">{cardName}</p>
              </div>
            </div>
          </DialogHeader>

          <div className="mb-3 flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setReprocessOpen(true)}>
              <RefreshCw size={14} className="mr-1" />
              Reprocessar faturas
            </Button>
            <Button variant="outline" size="sm" onClick={logic.openCreate}>
              <Plus size={14} className="mr-1" />
              Nova vigência
            </Button>
          </div>

          {logic.isLoading ? (
            <div className="py-8">
              <Spinner />
            </div>
          ) : logic.cycles.length > 0 ? (
            <div className="space-y-2">
              {logic.cycles.map((cycle) => (
                <CycleRow
                  key={cycle.creditCardStatementCycle}
                  cycle={cycle}
                  onEdit={logic.openEdit}
                  onDelete={logic.requestDelete}
                />
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-text-muted">
              Nenhuma vigência cadastrada para este cartão.
            </p>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={onClose}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CardCycleForm logic={logic} />

      <Dialog
        open={logic.pendingDelete !== null}
        onOpenChange={(value) => !value && logic.cancelDelete()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir vigência</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-text-muted">
            A vigência será excluída e o período vizinho será estendido para manter a continuidade.
            Esta ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={logic.cancelDelete} disabled={logic.isDeleting}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={logic.confirmDelete} loading={logic.isDeleting}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {reprocessOpen && (
        <ReprocessDialog card={card} onClose={() => setReprocessOpen(false)} />
      )}
    </>
  );
}

function CycleRow({
  cycle,
  onEdit,
  onDelete,
}: {
  cycle: StatementCycle;
  onEdit: (cycle: StatementCycle) => void;
  onDelete: (cycle: StatementCycle) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-surface-2 p-3">
      <div>
        <p className="text-sm font-semibold text-text">
          {formatDate(cycle.dateStart)}
          {cycle.dateEnd ? ` — ${formatDate(cycle.dateEnd)}` : ' — vigente'}
        </p>
        <p className="text-xs text-text-muted">
          Fechamento dia {cycle.closingDay} · Vencimento dia {cycle.dueDay}
          {cycle.active ? ' · ativa' : ''}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" onClick={() => onEdit(cycle)}>
          Editar
        </Button>
        <Button variant="ghost" size="sm" className="text-expense" onClick={() => onDelete(cycle)}>
          Excluir
        </Button>
      </div>
    </div>
  );
}

function ReprocessDialog({ card, onClose }: { card: number; onClose: () => void }) {
  const reprocess = useReprocessInvoices(card);
  const [fromDate, setFromDate] = useState(() => `${new Date().toISOString().slice(0, 7)}-01`);

  const handleSubmit = () => {
    if (!fromDate) return;
    reprocess.mutate(fromDate, { onSuccess: onClose });
  };

  return (
    <Dialog open onOpenChange={(value) => !value && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reprocessar faturas</DialogTitle>
        </DialogHeader>
        <p className="mb-3 text-sm text-text-muted">
          Recalcula as faturas a partir da data informada, reorganizando transações nos ciclos.
        </p>
        <div>
          <Label htmlFor="reprocess-from">A partir de</Label>
          <Input
            id="reprocess-from"
            type="date"
            className="w-full"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={reprocess.isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} loading={reprocess.isPending} disabled={!fromDate}>
            Reprocessar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
