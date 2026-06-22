import { Input, Label } from 'finnance-frontend';

export function Default() {
  return (
    <div style={{ maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Label htmlFor="nome">Nome da conta</Label>
      <Input id="nome" defaultValue="Conta Corrente Nubank" />
    </div>
  );
}

export function Placeholder() {
  return (
    <div style={{ maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Label htmlFor="email">E-mail</Label>
      <Input id="email" type="email" placeholder="seu@email.com" />
    </div>
  );
}

export function Disabled() {
  return (
    <div style={{ maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Label htmlFor="ro">Identificador</Label>
      <Input id="ro" defaultValue="usr_4550" disabled />
    </div>
  );
}
