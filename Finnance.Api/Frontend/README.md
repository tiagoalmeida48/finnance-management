# Finnance Management

Aplicacao web para gestao financeira pessoal com contas, transacoes, cartoes de credito, faturas, acompanhamento mensal, simulador salarial, importacao CSV, integracao Pluggy e gestao administrativa de usuarios.

## Stack

- React 19 + TypeScript 5.9
- Vite/rolldown-vite 7.2
- Tailwind CSS 4
- React Router 7
- TanStack Query 5
- Zustand 5
- React Hook Form 7 + Zod 4
- Framer Motion 12
- Recharts 3
- Supabase Auth, PostgreSQL, RLS, RPCs e Edge Functions

## Requisitos

- Node.js 20+
- pnpm 10.28.1 ou compativel
- Projeto Supabase configurado

## Configuracao

Instale as dependencias:

```bash
pnpm install
```

Crie um arquivo `.env` ou `.env.local` com:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Para as Edge Functions Pluggy, configure no Supabase:

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
PLUGGY_CLIENT_ID=
PLUGGY_CLIENT_SECRET=
```

## Comandos

```bash
pnpm dev          # ambiente local
pnpm run build    # type-check + build de producao
pnpm run lint     # ESLint
pnpm run preview  # preview local do build
pnpm run format   # Prettier em src
pnpm run check:ci # lint + build
```

Nao ha suite de testes automatizados ativa no estado atual do projeto.

## Estrutura Principal

```text
src/
  routes/                 # rotas, lazy loading e guards
  pages/                  # paginas por dominio
  shared/components/      # UI, layout, forms e composites
  shared/hooks/api/       # hooks React Query
  shared/services/        # acesso a Supabase/RPCs por dominio
  shared/interfaces/      # contratos TypeScript
  shared/schemas/         # schemas Zod
  shared/constants/       # query keys e constantes de dominio
  shared/stores/          # Zustand
  shared/theme/           # tema derivado dos tokens CSS
  shared/utils/           # calculos puros e helpers
  lib/supabase/           # client Supabase e AuthProvider

supabase/
  functions/              # Edge Functions Pluggy
  migrations/             # historico SQL do banco
```

## Funcionalidades

- autenticacao e rotas protegidas;
- dashboard com indicadores, graficos e transacoes recentes;
- contas bancarias com saldo e vinculo Pluggy;
- categorias de receita/despesa;
- transacoes manuais, em lote, parceladas e recorrentes;
- importacao CSV;
- sincronizacao Pluggy com previa antes de confirmar;
- cartoes de credito, faturas e ciclos de fechamento/vencimento;
- acompanhamento mensal;
- simulador e configuracoes salariais;
- perfil do usuario;
- gestao de usuarios para administradores.

## Documentacao

- [Arquitetura](docs/architecture.md)
- [Status da migracao para RPCs](docs/migration-to-rpc-plan.md)
- [PRD](docs/PRD.md)
- [SPECS](docs/SPECS.md)

## Observacoes Tecnicas

- O frontend usa principalmente RPCs Supabase, com poucos acessos diretos residuais.
- As chaves do React Query ficam em `src/shared/constants/queryKeys.ts`.
- `supabase/.temp/` e cache local da CLI e nao deve ser versionado.
- Antes de deploy limpo, conferir as RPCs chamadas pelo frontend contra as migrations aplicadas no banco remoto.
