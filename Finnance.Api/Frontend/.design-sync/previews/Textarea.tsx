import { Textarea, Label } from 'finnance-frontend';

export function Default() {
  return (
    <div style={{ maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Label htmlFor="obs">Observações</Label>
      <Textarea
        id="obs"
        rows={4}
        defaultValue="Pagamento referente à fatura de junho do cartão Nubank."
      />
    </div>
  );
}

export function Placeholder() {
  return (
    <div style={{ maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Label htmlFor="obs2">Observações</Label>
      <Textarea id="obs2" rows={4} placeholder="Opcional" />
    </div>
  );
}
