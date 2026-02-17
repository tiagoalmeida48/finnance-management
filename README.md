# Finnance Management

Aplicação web para gestão financeira pessoal com foco em:
- contas e saldos
- transações (manual, em lote e importação CSV)
- categorias
- cartões de crédito e faturas
- acompanhamento mensal de contas
- simulador de salário/holerite
- perfil do usuário e gestão de usuários (admin)

## Stack

- React 19 + TypeScript 5.9
- rolldown-vite 7.2.5
- Material UI v7
- React Query v5
- React Hook Form v7 + Zod v4
- Framer Motion 12
- Recharts 3
- Supabase (Auth + PostgreSQL + RLS)

## Requisitos

- Node.js 20+
- pnpm 9+

## Configuração

1. Instale dependências:

```bash
pnpm install
```

2. Crie `.env.local` com as variáveis:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

## Comandos

```bash
pnpm dev          # ambiente local
pnpm exec eslint src
pnpm run build    # type-check + bundle de produção
pnpm run test     # suite mínima com Vitest
pnpm run test:watch
pnpm run check:ci # lint + build + test
```

## Estrutura principal

```text
src/
  app-routes/            # rotas com lazy loading
  pages/                 # páginas de rota
  shared/components/     # componentes reutilizáveis por domínio
  shared/hooks/          # regras de página/estado
  shared/services/       # acesso a dados e regras de persistência
  shared/interfaces/     # contratos e tipos
  shared/constants/      # chaves compartilhadas (ex.: query keys)
  shared/contexts/       # contexts (auth, branding)
  shared/theme/          # tema MUI customizado
  shared/utils/          # utilitários e formatadores
  lib/supabase/          # cliente Supabase e AuthProvider
```

## Qualidade técnica

- Lint: `pnpm exec eslint src`
- Type-check: `pnpm exec tsc -b`
- Build: `pnpm run build`
- Testes: `pnpm run test`

Recomendado configurar CI para rodar esses passos em pull requests e pushes.

## Testes incluídos

- parser e normalização da importação de transações
- resumo de tracking mensal
- filtro de atualizações em grupo de transações
- cálculos centrais de folha (`calculatePayroll`)
- resumo e agrupamento de transações
- lógica de ciclos de fatura de cartão

## Observações

- O projeto usa chave de cache do React Query centralizada em `src/shared/constants/queryKeys.ts`.
- O modo admin depende do campo `is_admin` no perfil do usuário autenticado.
- Gerenciador de pacotes: sempre usar **pnpm**.
