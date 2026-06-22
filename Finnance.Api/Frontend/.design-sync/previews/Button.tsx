import { Button } from 'finnance-frontend';

export function Variants() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
      <Button variant="primary">Salvar alterações</Button>
      <Button variant="secondary">Cancelar</Button>
      <Button variant="outline">Editar</Button>
      <Button variant="ghost">Ver detalhes</Button>
      <Button variant="danger">Excluir</Button>
    </div>
  );
}

export function Sizes() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
      <Button size="sm">Pequeno</Button>
      <Button size="md">Médio</Button>
      <Button size="lg">Grande</Button>
    </div>
  );
}

export function States() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
      <Button>Padrão</Button>
      <Button loading>Salvando</Button>
      <Button disabled>Indisponível</Button>
    </div>
  );
}
