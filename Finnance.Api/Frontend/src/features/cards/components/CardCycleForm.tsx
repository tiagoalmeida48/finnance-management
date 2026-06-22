import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Textarea,
} from '@/shared/components/ui';
import type { useCardCyclesLogic } from '../hooks/useCardCyclesLogic';

interface CardCycleFormProps {
  logic: ReturnType<typeof useCardCyclesLogic>;
}

export function CardCycleForm({ logic }: CardCycleFormProps) {
  const { mode, form, error, isMutating, closeForm, updateForm, submit } = logic;
  const isEdit = mode === 'edit';

  return (
    <Dialog open={mode !== null} onOpenChange={(value) => !value && closeForm()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar vigência' : 'Nova vigência'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="cycle-start">Início da vigência</Label>
            <Input
              id="cycle-start"
              type="date"
              className="w-full"
              value={form.dateStart}
              onChange={(e) => updateForm({ dateStart: e.target.value })}
            />
          </div>

          {isEdit ? (
            <div>
              <Label htmlFor="cycle-end">Encerramento (opcional)</Label>
              <Input
                id="cycle-end"
                type="date"
                className="w-full"
                value={form.dateEnd}
                onChange={(e) => updateForm({ dateEnd: e.target.value })}
              />
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cycle-closing">Dia de fechamento</Label>
              <Input
                id="cycle-closing"
                type="number"
                min={1}
                max={31}
                className="w-full"
                value={form.closingDay || ''}
                onChange={(e) => updateForm({ closingDay: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="cycle-due">Dia de vencimento</Label>
              <Input
                id="cycle-due"
                type="number"
                min={1}
                max={31}
                className="w-full"
                value={form.dueDay || ''}
                onChange={(e) => updateForm({ dueDay: Number(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="cycle-notes">Observações</Label>
            <Textarea
              id="cycle-notes"
              className="min-h-20"
              value={form.notes}
              maxLength={500}
              onChange={(e) => updateForm({ notes: e.target.value })}
            />
          </div>

          {error ? <p className="text-sm text-expense">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={closeForm} disabled={isMutating}>
            Cancelar
          </Button>
          <Button onClick={submit} loading={isMutating}>
            {isEdit ? 'Salvar' : 'Criar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
