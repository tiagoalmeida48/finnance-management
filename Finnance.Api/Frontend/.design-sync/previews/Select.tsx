import { Select, Label } from 'finnance-frontend';

export function WithOptions() {
  return (
    <div style={{ maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Label htmlFor="tipo">Tipo de conta</Label>
      <Select
        id="tipo"
        defaultValue="corrente"
        options={[
          { value: 'corrente', label: 'Conta corrente' },
          { value: 'poupanca', label: 'Poupança' },
          { value: 'investimento', label: 'Investimento' },
          { value: 'carteira', label: 'Carteira' },
        ]}
      />
    </div>
  );
}

export function WithChildren() {
  return (
    <div style={{ maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Label htmlFor="situacao">Situação</Label>
      <Select id="situacao" defaultValue="">
        <option value="">Todas</option>
        <option value="pagas">Pagas</option>
        <option value="pendentes">Pendentes</option>
      </Select>
    </div>
  );
}
