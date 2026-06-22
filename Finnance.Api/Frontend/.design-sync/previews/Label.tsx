import { Label, Input } from 'finnance-frontend';

export function WithInput() {
  return (
    <div style={{ maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Label htmlFor="limite">Limite (R$)</Label>
      <Input id="limite" type="number" defaultValue="8000" />
    </div>
  );
}

export function Standalone() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Label>Nome completo</Label>
      <Label>E-mail</Label>
      <Label>Forma de pagamento</Label>
    </div>
  );
}
