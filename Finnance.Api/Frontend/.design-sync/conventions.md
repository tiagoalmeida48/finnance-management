# Finnance Design System — convenções

Design system de um app de gestão financeira pessoal (pt-BR), tema **escuro** por padrão. Stack: React 19 + Tailwind v4 (tokens em `@theme`) + `class-variance-authority`. Componentes em `window.FinnanceDS.*`.

## Setup e wrapping

Não há provider obrigatório — os componentes são auto-estilizados pelo `styles.css` (tokens + utilitárias Tailwind). Garanta apenas que o `styles.css` esteja carregado e que o container raiz use o fundo do tema:

```jsx
<div className="min-h-screen bg-bg text-text">
  {/* sua tela aqui */}
</div>
```

Tema escuro é a base (`color-scheme: dark`). Fonte: **Plus Jakarta Sans** (corpo) e **Inter** (código), servidas via Google Fonts.

## Idioma de estilo — utilitárias Tailwind com tokens do tema

Estilize com classes utilitárias Tailwind que referenciam os tokens do DS (não invente cores cruas). Vocabulário real:

| Papel | Classes |
|---|---|
| Fundos | `bg-bg` (app), `bg-surface` (cards/painéis), `bg-surface-2` (camada 2/inputs) |
| Texto | `text-text` (principal), `text-text-muted` (secundário) |
| Marca / ação | `bg-primary` / `text-primary` / `hover:bg-primary-hover` (terracota) |
| Semântica financeira | `text-income` / `bg-income` (verde, receita), `text-expense` / `bg-expense` (vermelho, despesa), `text-transfer` / `bg-transfer` (azul, transferência) |
| Bordas | `border-border` |
| Raio | `rounded-md`, `rounded-lg`, `rounded-xl` |

Use as cores semânticas com significado: receita sempre `income`, despesa sempre `expense`. Transparências de token (ex.: `bg-income/20`) para chips/badges.

## Onde a verdade vive

- `styles.css` (e seu `@import` de `_ds_bundle.css`) — tokens e utilitárias compiladas. Leia antes de estilizar.
- `components/<Grupo>/<Nome>/<Nome>.d.ts` — contrato de props de cada componente.
- `components/<Grupo>/<Nome>/<Nome>.prompt.md` — uso e exemplos por componente.

## Componentes

`Button` (variant: primary/secondary/outline/ghost/danger; size: sm/md/lg; `loading`), `Card` (+ `CardHeader`/`CardTitle`/`CardContent`/`CardFooter`), `Badge` (variant: default/primary/income/expense/transfer), `Input`, `Textarea`, `Select` (`options[]` ou `<option>` children), `Checkbox`, `Label`, `Dialog` (+ `DialogContent`/`DialogHeader`/`DialogTitle`/`DialogFooter`; controlado por `open`/`onOpenChange`), `Spinner`.

Ações destrutivas usam `Button variant="danger"`. Confirmações usam `Dialog` (nunca `window.confirm`).

## Exemplo idiomático

```jsx
<Card>
  <CardHeader>
    <CardTitle>Fatura de junho</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="flex items-center justify-between">
      <span className="text-sm text-text-muted">Total</span>
      <Badge variant="expense">Em aberto</Badge>
    </div>
    <p className="text-2xl font-bold text-text">R$ 1.280,90</p>
  </CardContent>
  <CardFooter>
    <Button variant="primary" size="sm">Pagar fatura</Button>
    <Button variant="ghost" size="sm">Ver lançamentos</Button>
  </CardFooter>
</Card>
```
