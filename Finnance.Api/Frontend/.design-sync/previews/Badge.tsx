import { Badge } from 'finnance-frontend';

export function Variants() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
      <Badge variant="default">Padrão</Badge>
      <Badge variant="primary">Destaque</Badge>
      <Badge variant="income">Receita</Badge>
      <Badge variant="expense">Despesa</Badge>
      <Badge variant="transfer">Transferência</Badge>
    </div>
  );
}

export function InContext() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
      <Badge variant="income">Pago</Badge>
      <Badge variant="expense">Pendente</Badge>
      <Badge variant="primary">3ª parcela</Badge>
      <Badge variant="primary">Recorrente</Badge>
    </div>
  );
}
