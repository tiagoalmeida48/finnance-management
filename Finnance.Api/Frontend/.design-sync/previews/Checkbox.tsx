import { Checkbox, Label } from 'finnance-frontend';

export function Default() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text)' }}>
        <Checkbox defaultChecked />
        <span>Marcar como pago</span>
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text)' }}>
        <Checkbox />
        <span>Transação recorrente</span>
      </label>
      <label
        style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-muted)' }}
      >
        <Checkbox disabled />
        <span>Parcelado (indisponível)</span>
      </label>
    </div>
  );
}
