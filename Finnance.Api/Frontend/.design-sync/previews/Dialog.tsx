import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Label,
} from 'finnance-frontend';

export function Open() {
  return (
    <Dialog open onOpenChange={() => {}}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova conta</DialogTitle>
        </DialogHeader>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Label htmlFor="dlg-nome">Nome</Label>
          <Input id="dlg-nome" defaultValue="Conta Corrente Nubank" />
        </div>
        <DialogFooter>
          <Button variant="ghost">Cancelar</Button>
          <Button variant="primary">Criar conta</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function Confirm() {
  return (
    <Dialog open onOpenChange={() => {}}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir cartão</DialogTitle>
        </DialogHeader>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Tem certeza que deseja excluir o cartão{' '}
          <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>Nubank Roxinho</span>? Essa
          ação não pode ser desfeita.
        </p>
        <DialogFooter>
          <Button variant="ghost">Cancelar</Button>
          <Button variant="danger">Excluir</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
