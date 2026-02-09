# Finnance Management

Aplicacao web para gestao financeira pessoal com foco em:
- contas e saldos
- transacoes (manual, em lote e importacao CSV)
- categorias
- cartoes de credito e faturas
- acompanhamento mensal de contas
- simulador de salario/holerite
- perfil do usuario e gestao de usuarios (admin)

## Stack

- React 19 + TypeScript
- Vite (rolldown-vite)
- Material UI
- React Query
- React Hook Form + Zod
- Supabase

## Requisitos

- Node.js 20+
- pnpm 9+

## Configuracao

1. Instale dependencias:

```bash
pnpm install
```

2. Crie `.env` com base no exemplo:

```bash
cp .env.example .env
```

3. Preencha as variaveis:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

## Comandos

```bash
pnpm dev          # ambiente local
pnpm exec eslint src
pnpm run build    # type-check + bundle de producao
pnpm run test     # suite minima com Vitest
pnpm run test:watch
pnpm run check:ci # lint + build + test
```

## Estrutura principal

```text
src/
  pages/                 # paginas de rota
  shared/components/     # componentes reutilizaveis
  shared/hooks/          # regras de pagina/estado
  shared/services/       # acesso a dados e regras de persistencia
  shared/interfaces/     # contratos e tipos
  shared/constants/      # chaves compartilhadas (ex.: query keys)
```

## Qualidade tecnica

- Lint: `pnpm exec eslint src`
- Type-check: `pnpm exec tsc -b`
- Build: `pnpm run build`
- Testes: `pnpm run test`

A CI em `.github/workflows/ci.yml` roda esses passos em pull requests e pushes.

## Testes incluidos

- parser e normalizacao da importacao de transacoes
- resumo de tracking mensal
- filtro de atualizacoes em grupo de transacoes
- calculos centrais de folha (`calculatePayroll`)
- resumo e agrupamento de transacoes

## Observacoes

- O projeto usa chave de cache do React Query centralizada em `src/shared/constants/queryKeys.ts`.
- O modo admin depende do campo `is_admin` no perfil do usuario autenticado.
