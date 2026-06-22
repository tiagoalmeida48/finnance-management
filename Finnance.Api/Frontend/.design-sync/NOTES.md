# Design Sync — NOTES (finnance-frontend)

Repo-specific gotchas for `/design-sync`. Append one bullet per gotcha.

## Setup quirks

- **This is a Vite SPA, not a packaged component library.** No `dist/`, no `main`/`module`/`exports`. The DS is the 11 primitives in `src/shared/components/ui` (Button, Card, Badge, Input, Textarea, Select, Checkbox, Label, Dialog, Spinner). Converter runs in **synth-entry mode** (no dist + componentSrcMap pins each src path). No build command needed — esbuild bundles from source.
- **Tailwind v4, no config file** (`@tailwindcss/vite`, tokens in `@theme` inside `src/index.css`). Utility classes are tree-shaken, so the RAW `src/index.css` does NOT contain `bg-surface`/`text-text`/etc — only the `@theme` tokens. The previews would render unstyled if pointed at it.
- **CSS is PRE-COMPILED for the sync**: `.design-sync/ds-styles.css` is the Tailwind entry (`@import 'tailwindcss'` + `@source` globs over the ui components and previews + the `@theme` tokens + base + toast keyframe). Compiled via `npx @tailwindcss/cli@4.1.18 -i .design-sync/ds-styles.css -o .design-sync/ds-compiled.css`. `cfg.cssEntry` points at the COMPILED `.design-sync/ds-compiled.css`. **Re-sync risk**: if a component gains a new utility class, re-run the Tailwind CLI before the converter or that class won't be in the stylesheet. The `@source` globs cover `src/shared/components/ui` and `.design-sync/previews`, so authored previews' classes are included too.
- Aliases: `@/* -> src/*` (`tsconfig.app.json`). `cfg.tsconfig` set so esbuild resolves `@/shared/utils` (the `cn` helper).
- Deps the components pull: `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`. All in node_modules.

## Re-sync risks

- **`ds-compiled.css` must be regenerated before every build** — it's the Tailwind-compiled stylesheet (`npx @tailwindcss/cli@4.1.18 -i .design-sync/ds-styles.css -o .design-sync/ds-compiled.css`), NOT auto-rebuilt by the converter. If a component gains a new utility class and you skip this, the class won't be in `styles.css` and the preview renders unstyled. The `@source` globs in `ds-styles.css` cover `src/shared/components/ui` + `.design-sync/previews`.
- **`.d.ts` props are hand-written in `cfg.dtsPropsFor`** — the cva/VariantProps pattern doesn't extract in synth-entry mode (auto `.d.ts` came out `[key: string]: unknown`). If a component's API changes (new variant, new prop), UPDATE the matching `dtsPropsFor` entry by hand — it won't track source automatically. The previews exercise the real component so they'd still render, but the contract the design agent sees would be stale.
- **Fonts load remotely** (Google Fonts `@import` in `ds-styles.css` → compiled into `styles.css`). `[FONT_REMOTE]` is expected, non-blocking. If offline-safe fonts are ever required, ship woff2 via `cfg.extraFonts`.
- `Dialog` and `Select` need a portal/overlay context only for the open state; previews compose the trigger+content statically. `Dialog` uses `cardMode: single` (override) so the open state renders in-card.
- Run was a first sync into the empty "Design System" project (incremental path). Re-sync uses `resync.mjs --remote` against the uploaded `_ds_sync.json`; grades carry forward by source hash. Scope = 10 primitives from `shared/components/ui`; feature components (forms/tables) are intentionally OUT (they depend on hooks/React Query/API, not design system).
