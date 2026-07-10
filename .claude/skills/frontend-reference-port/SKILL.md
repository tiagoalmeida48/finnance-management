---
name: frontend-reference-port
description: Padrão para portar features do frontend de referência (docs/Referencia, Supabase, pages+shared) para o Frontend atual (Finnance.Api/Frontend, API .NET, features/ folder-by-type). Use ao replicar, migrar ou portar qualquer página/feature/componente da Referencia para o app em produção ("portar da Referencia", "replicar frontend", "migrar página X", "trazer feature do legado").
---

# Frontend Reference Port

Replica a **funcionalidade e UX** de `docs/Referencia/src` no `Finnance.Api/Frontend/src`, reescrevendo no padrão do destino. Nunca é cópia literal: a Referencia é acoplada ao **Supabase**; o destino consome a **API .NET** via `apiClient`. O código atual do destino é a fonte de verdade — não a skill `react-feature-pattern` nem memórias antigas (que descrevem a Referencia).

## As duas arquiteturas

| | Referencia (ORIGEM) | Frontend atual (DESTINO) |
|---|---|---|
| Backend | Supabase (`supabase.from`, RPCs, auth-context) | API .NET via `@/config/http` `apiClient` |
| Organização | `pages/<feat>/{components,hooks}` + `shared/` rico | `features/<feat>/{components,hooks,services,types,constants,index.ts}` + `pages/<feat>/<Feature>Page.tsx` |
| Auth | `lib/supabase/auth-context` | `@/features/auth` (`useAuth`, `AuthProvider`, Bearer em localStorage) |
| Rotas | `routes/AppRouter` | `@/app/AppRouter` + `ProtectedRoute`/`AdminRoute`, lazy |
| Strings | `@/shared/i18n/messages` | **pt-BR inline** (o destino NÃO usa i18n) |
| Estilo | Tailwind + tokens | Tailwind + tokens em `@/index.css` |

## Folder-by-type do destino (obrigatório)

```
src/features/<feat>/
  components/        # componentes da feature (.tsx)
  hooks/             # useX (React Query) + use<Feature>PageLogic
  services/          # <feat>Service.ts — objeto com apiClient.{get,post,put,delete}
  types/             # <feat>.types.ts
  constants.ts       # enums/constantes locais (opcional)
  index.ts           # barrel export público da feature
src/pages/<feat>/<Feature>Page.tsx   # container fino, consome use<Feature>PageLogic
```

Adiciona a rota em `@/app/AppRouter.tsx` (lazy + dentro de `ProtectedRoute`; usa `AdminRoute` se a página for só admin) e o item no `@/layouts/Sidebar.tsx`.

## Regras de tradução

1. **Service**: troca `supabase.from('x')...` / `supabase.rpc('fn')` por `apiClient.get/post/put/delete('/rota', ...)`. Rotas seguem o backend .NET kebab-case (`/category/list`, `/bank-account/create`). `apiClient` já desembrulha `ResultApi<T>.result` e lança `ApiError` em falha — o service retorna o tipo puro.
2. **Hooks de dados**: React Query em `hooks/use<Feature>.ts` (`useX`, `useCreateX`, `useUpdateX`, `useDeleteX`), com `queryKey` estável e `invalidateQueries` no sucesso.
3. **Logic hook**: `use<Feature>PageLogic` concentra estado, RHF e handlers. A página/componente só recebe dados e funções — zero lógica na UI.
4. **Forms**: `react-hook-form` + `zod` (`@hookform/resolvers/zod`); schema junto da feature.
5. **Tipos**: nada de tipos do Supabase; define interfaces em `types/`. Campos seguem os DTOs do backend (ex. `category`, `categoryType`, `active` — camelCase do `ResultApi`).
6. **Strings pt-BR inline**, com acentuação correta. Não importar `messages`.
7. **Componentes compartilhados**: usa `@/shared/components/ui` (`Button`, `Card`, `Dialog`, `Input`, `Label`, `Badge`, `Spinner`) e `@/shared/components/feedback` (toast). Não recria primitivos que já existem.
8. **Sem comentários** (`//`, `/* */`, JSDoc). Remove qualquer comentário vindo da Referencia.
9. **Máx. 300 linhas/arquivo**; quebra em subcomponentes/hooks quando passar.
10. **Imports por alias** `@/...`. **pnpm** sempre (`pnpm@10.28.1`).

## O que NÃO trazer

- Supabase (`@supabase/supabase-js`, `lib/supabase/*`, RPCs cliente) — a lógica de negócio mora no backend .NET.
- `shared/i18n/messages` — usa strings inline.
- Componentes `shared/` da Referencia que duplicam o que o destino já tem — mapeia para os equivalentes do destino.
- `framer-motion` só se a animação for essencial à UX (preferir CSS/Tailwind). `papaparse` é ok para import CSV.

## Gate

Roda `pnpm check:ci` (= `eslint src` + `tsc -b && vite build`) no `Finnance.Api/Frontend`. Sem erros de lint/TS/build, senão a feature não está pronta. Confere também que a rota e o item de menu funcionam.

## Endpoints de referência (backend .NET)

Os módulos backend existentes ditam as rotas: `bank-account`, `category`, `category-type`, `credit-card`, `transaction`, `transaction-type`, `payment-method`, `account-type`, `invoice-status`, `audit-log`, `user`, `auth`. Confirma a rota real no controller correspondente em `Finnance.Api/Modules/<X>/` antes de assumir. Se a feature da Referencia depende de um endpoint que o backend ainda não expõe, **registra como pendência** (não inventa endpoint nem reintroduz Supabase).
