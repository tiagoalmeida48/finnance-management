import { Spinner } from 'finnance-frontend';

export function Default() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Spinner />
    </div>
  );
}

export function InContext() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        padding: 24,
      }}
    >
      <Spinner />
      <span style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Carregando lançamentos…</span>
    </div>
  );
}
