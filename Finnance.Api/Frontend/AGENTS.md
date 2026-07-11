# AGENTS.md — Frontend (Finnance.Api/Frontend)

Instruções para qualquer agente de IA. Este arquivo é a **fonte canônica** do frontend (o `CLAUDE.md` ao lado apenas o importa). SPA React 19 + TypeScript estrito do `finnance-management`. **Esta é a aplicação em produção** e o destino da migração do frontend de referência. UI em **pt-BR**; comunique-se em pt-BR.

> Antes deste app, o frontend era um legado React + **Supabase** (vivia em `docs/Referencia`, removido do repositório em 2026-07-10 após a migração ser concluída). Este `Finnance.Api/Frontend` é a reescrita sobre a **API .NET** local e é a única fonte de verdade do frontend.

---

## 1. Stack

React 19 · TypeScript estrito · Vite · Tailwind v4 (`@tailwindcss/vite`) · React Query (`@tanstack/react-query`) · React Router v7 · React Hook Form + Zod (`@hookform/resolvers`) · Zustand · axios · recharts · lucide-react · date-fns. **Sempre pnpm** (`pnpm@10.28.1`).

```bash
pnpm dev          # vite
pnpm build        # tsc -b && vite build
pnpm lint         # eslint src
pnpm check:ci     # eslint src + build  ← gate (sem suíte de testes)
pnpm format       # prettier
```

`vite build` gera para `../wwwroot/`, servido pelo backend como SPA (`MapFallbackToFile`).

## 2. Arquitetura — folder-by-type

```
src/
├── app/                 # AppRouter, ProtectedRoute, AdminRoute (rotas + guards, lazy)
├── config/              # env, constants (IDs de lookup, AUTH_TOKEN_KEY), http (apiClient), queryClient
├── layouts/             # MainLayout, Sidebar
├── pages/<feat>/<Feature>Page.tsx     # container fino; consome use<Feature>PageLogic
├── features/<feat>/     # uma pasta por domínio:
│   ├── components/       # componentes da feature
│   ├── hooks/            # use<Feature> (React Query) + use<Feature>PageLogic (estado/handlers)
│   ├── services/         # <feat>Service.ts — apiClient.{get,post,put,delete}
│   ├── types/            # <feat>.types.ts
│   ├── constants.ts      # (opcional)
│   └── index.ts          # barrel export público
└── shared/              # components/ui, components/feedback (toast), hooks, types, utils
```

**Fluxo de dados:** `pages → features/<feat>/hooks (React Query) → features/<feat>/services → apiClient → API .NET`.

## 3. Comunicação com a API .NET

- `config/http.ts` expõe `apiClient.{get,post,put,delete}`: desembrulha `ResultApi<T>.result` e lança `ApiError` quando `success === false`. Services retornam o tipo puro.
- **Auth por Bearer**: token em `sessionStorage` (`AUTH_TOKEN_KEY`), injetado no header `Authorization` pelo interceptor; 401 limpa o token e redireciona para `/login`.
- Rotas seguem o backend kebab-case (`/category/list`, `/bank-account/create`). Confirme a rota real no controller em `Finnance.Api/Modules/<X>/`.
- `config/constants.ts` tem os IDs de lookup (`TransactionTypeId`, `CategoryTypeId`, `AccountTypeId`, `InvoiceStatusId`, `RoleId`).

## 4. Convenções (invioláveis)

1. **Separação estrita de lógica**: toda página/feature tem um `use<Feature>PageLogic`; a UI só recebe dados e funções. Zero lógica de negócio no JSX.
2. **Zero comentários** (`//`, `/* */`, JSDoc). Remova qualquer comentário ao editar.
3. **Máx. 300 linhas/arquivo** — quebre em subcomponentes/hooks.
4. **Strings pt-BR inline** com acentuação correta. **Não** há i18n/`messages`.
5. **Forms**: React Hook Form + Zod (`zodResolver`), schema junto da feature.
6. **Componentes compartilhados**: use `@/shared/components/ui` (`Button`, `Card`, `Dialog`, `Input`, `Label`, `Badge`, `Spinner`) e `@/shared/components/feedback` (toast). Não recrie primitivos.
7. **Imports por alias** `@/...`.
8. **Rotas**: adicione em `app/AppRouter.tsx` (lazy, dentro de `ProtectedRoute`; `AdminRoute` se admin-only) e o item em `layouts/Sidebar.tsx`.

## 5. Estado

- **Servidor**: React Query (queryKeys estáveis por feature, `invalidateQueries` no sucesso).
- **Auth**: `@/features/auth` (`AuthProvider`, `useAuth`) sobre o Bearer/sessionStorage.
- **UI**: Zustand (mínimo).
- **Notificações**: toast em `@/shared/components/feedback`.

## 6. Histórico da migração

A migração do legado Supabase foi **concluída** e o app de referência foi removido do repositório (2026-07-10). Só **Pluggy/Open Finance** não foi portado (decisão de produto). Regra que permanece: uma feature só existe no frontend se houver endpoint .NET que a sirva — senão é **pendência de backend**, não se inventa endpoint nem se reintroduz Supabase.
