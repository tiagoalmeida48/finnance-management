import { Card, CardHeader, CardTitle, CardContent, CardFooter, Button, Badge } from 'finnance-frontend';

export function Basic() {
  return (
    <div style={{ maxWidth: 360 }}>
      <Card>
        <CardHeader>
          <CardTitle>Conta Corrente Nubank</CardTitle>
        </CardHeader>
        <CardContent>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Saldo atual</p>
          <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-text)' }}>R$ 4.550,00</p>
        </CardContent>
      </Card>
    </div>
  );
}

export function WithFooter() {
  return (
    <div style={{ maxWidth: 360 }}>
      <Card>
        <CardHeader>
          <CardTitle>Fatura de junho</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Total</span>
            <Badge variant="expense">Em aberto</Badge>
          </div>
          <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)' }}>R$ 1.280,90</p>
        </CardContent>
        <CardFooter>
          <Button variant="primary" size="sm">Pagar fatura</Button>
          <Button variant="ghost" size="sm">Ver lançamentos</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
