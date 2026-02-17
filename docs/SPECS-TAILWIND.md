## CONTEXTO DO PROJETO

Você é um engenheiro frontend sênior especializado em migração de sistemas de design. Sua missão é planejar e executar a migração completa de um sistema React que atualmente usa **Material UI (MUI)** para **Tailwind CSS + shadcn/ui + Radix UI**.

### Stack atual:
- React + Vite + TypeScript
- Material UI (MUI) v[PREENCHER: versão, ex: 5.15]
- @emotion/react + @emotion/styled (CSS-in-JS runtime)
- @mui/icons-material
- [PREENCHER: outras libs MUI usadas, ex: @mui/x-date-pickers, @mui/x-data-grid]

### Stack alvo:
- React + Vite + TypeScript (mantém)
- Tailwind CSS v4
- shadcn/ui (componentes copiados localmente)
- Radix UI (primitivos de acessibilidade)
- class-variance-authority (CVA) para variantes
- tailwind-merge + clsx (utilitário cn())
- lucide-react (ícones)

### Motivação da migração:
- Eliminar o runtime CSS-in-JS (Emotion) que degrada performance a cada render
- Reduzir bundle size (MUI adiciona ~100-200KB gzipped só de UI)
- Melhorar Core Web Vitals (LCP, FID, CLS)
- HMR mais rápido no Vite (MUI + Emotion causa conflitos documentados)
- Alinhar com a direção do ecossistema React (Server Components, zero-runtime CSS)

---

## REGRAS OBRIGATÓRIAS DA MIGRAÇÃO

1. **Migração incremental, não big-bang.** O sistema deve funcionar a cada etapa. MUI e Tailwind devem coexistir durante a transição.

2. **Manter 100% da funcionalidade.** Nenhum comportamento, interação, validação ou fluxo pode ser perdido.

3. **Manter acessibilidade.** Todos os componentes migrados devem ter WAI-ARIA equivalente ou superior (Radix UI garante isso).

4. **Componentização obrigatória.** Nenhuma classe Tailwind deve ser escrita diretamente em páginas/telas. Toda estilização deve estar encapsulada em componentes reutilizáveis em `components/ui/`.

5. **TypeScript strict.** Todos os componentes devem ter tipagem completa de props com interfaces/types exportadas.

6. **Sem regressão visual.** O design final deve ser equivalente ou superior ao atual. Diferenças visuais devem ser explicitamente documentadas e aprovadas.

7. **Cada componente migrado deve ter seu equivalente MUI documentado** em um comentário no topo do arquivo.

---

## FASE 0: AUDITORIA E PLANEJAMENTO

### 0.1 — Inventário de componentes MUI usados

Analise todo o código-fonte e gere uma tabela completa:

| Componente MUI | Quantidade de usos | Equivalente shadcn/ui | Existe pronto? | Complexidade |
|---|---|---|---|---|
| Button | 47 | Button | ✅ Sim | Baixa |
| TextField | 32 | Input + Label | ✅ Sim | Média |
| DataGrid | 8 | TanStack Table | ❌ Customizar | Alta |
| DatePicker | 5 | date-picker (shadcn) | ✅ Sim | Média |
| Dialog/Modal | 12 | Dialog | ✅ Sim | Baixa |
| Select | 18 | Select | ✅ Sim | Baixa |
| Autocomplete | 6 | Combobox | ✅ Sim | Média |
| Snackbar | 9 | Toast (sonner) | ✅ Sim | Baixa |
| Tabs | 7 | Tabs | ✅ Sim | Baixa |
| Drawer | 3 | Sheet | ✅ Sim | Baixa |
| Stepper | 2 | ❌ Customizar | ❌ Não | Alta |
| DataGrid | 5 | TanStack Table | ❌ Customizar | Alta |
| ... | ... | ... | ... | ... |

### 0.2 — Inventário de padrões de estilização MUI

Identifique TODOS os padrões usados no projeto:

- [ ] `sx` prop (`<Box sx={{ ... }}>`)
- [ ] `styled()` API (`const StyledDiv = styled('div')({...})`)
- [ ] `makeStyles` / `useStyles` (legacy v4)
- [ ] `theme.palette.*` / `theme.spacing()` / `theme.breakpoints.*`
- [ ] `<ThemeProvider>` customizado
- [ ] CSS overrides via `createTheme({ components: { MuiButton: { ... } } })`
- [ ] `useMediaQuery` hook
- [ ] `<Grid>` / `<Grid2>` layout
- [ ] `<Stack>` layout
- [ ] `<Box>` como div genérica
- [ ] `<Typography>` para texto
- [ ] `<Container>` para largura máxima

### 0.3 — Mapeamento do tema atual

Extraia do `createTheme()` atual:

```typescript
// Documente o tema completo para recriar em CSS variables do Tailwind
{
  palette: {
    primary: { main: '#[PREENCHER]', light: '...', dark: '...' },
    secondary: { main: '#[PREENCHER]', ... },
    error: { main: '#[PREENCHER]' },
    warning: { main: '#[PREENCHER]' },
    success: { main: '#[PREENCHER]' },
    background: { default: '#[PREENCHER]', paper: '#[PREENCHER]' },
    text: { primary: '#[PREENCHER]', secondary: '#[PREENCHER]' },
  },
  typography: {
    fontFamily: '[PREENCHER]',
    h1: { fontSize: '...', fontWeight: ... },
    // ... todos os variants
  },
  spacing: [PREENCHER], // base unit (default 8px)
  shape: { borderRadius: [PREENCHER] },
  breakpoints: { values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 } }
}
```

### 0.4 — Definir ordem de migração por prioridade

Ordene os componentes por:
1. **Frequência de uso** (mais usados primeiro = maior impacto)
2. **Disponibilidade no shadcn/ui** (prontos primeiro)
3. **Complexidade** (simples primeiro para ganhar momentum)
4. **Dependências** (componentes base antes dos compostos)

Sugestão de ordem:
```
WAVE 1 (Setup + Fundação):
  → Instalar Tailwind + shadcn/ui
  → Configurar tema em CSS variables
  → Migrar layout: Box → div, Stack → flex, Grid → grid, Container → max-w
  → Migrar Typography → classes utilitárias ou componente customizado

WAVE 2 (Componentes simples):
  → Button, IconButton
  → Input, Label, TextField (composto)
  → Select, Checkbox, Radio, Switch
  → Card, Paper → Card (shadcn)
  → Badge, Chip → Badge (shadcn)

WAVE 3 (Componentes de feedback):
  → Dialog/Modal
  → Drawer → Sheet
  → Snackbar → Toast (sonner)
  → Alert
  → Tooltip
  → Skeleton

WAVE 4 (Navegação):
  → Tabs
  → Breadcrumbs
  → Pagination
  → Menu/Dropdown → DropdownMenu
  → AppBar/Toolbar → header customizado

WAVE 5 (Componentes complexos):
  → Autocomplete → Combobox
  → DatePicker
  → DataGrid → TanStack Table + componentes shadcn
  → Stepper (customizado)
  → Accordion

WAVE 6 (Limpeza):
  → Remover todas as dependências MUI
  → Remover Emotion
  → Limpar configurações do Vite (optimizeDeps)
  → Audit final de bundle size
```

---

## FASE 1: SETUP INICIAL (coexistência MUI + Tailwind)

### 1.1 — Instalar dependências

```bash
# Tailwind CSS v4
npm install tailwindcss @tailwindcss/vite

# shadcn/ui CLI e dependências
npx shadcn@latest init

# Utilitários
npm install class-variance-authority tailwind-merge clsx

# Ícones (substitui @mui/icons-material)
npm install lucide-react

# Componentes complexos (conforme necessidade)
npm install @tanstack/react-table  # substitui DataGrid
npm install sonner                  # substitui Snackbar
npm install cmdk                    # substitui Autocomplete (command palette)
```

### 1.2 — Configurar Vite para coexistência

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc'; // SWC ao invés de Babel
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Manter optimizeDeps do MUI durante a transição
  optimizeDeps: {
    include: ['@mui/material', '@emotion/react', '@emotion/styled'],
  },
});
```

### 1.3 — Configurar CSS variables do tema

Converta o tema MUI para CSS variables no `app/globals.css` ou `src/index.css`:

```css
@import "tailwindcss";

@theme {
  /* Cores do tema convertidas do MUI */
  --color-primary: oklch(/* converter do hex MUI */);
  --color-primary-foreground: oklch(...);
  --color-secondary: oklch(...);
  --color-secondary-foreground: oklch(...);
  --color-destructive: oklch(...);  /* = error do MUI */
  --color-warning: oklch(...);
  --color-success: oklch(...);
  --color-muted: oklch(...);        /* = text.secondary do MUI */
  --color-muted-foreground: oklch(...);
  --color-accent: oklch(...);
  --color-accent-foreground: oklch(...);
  --color-background: oklch(...);   /* = background.default do MUI */
  --color-card: oklch(...);         /* = background.paper do MUI */
  --color-border: oklch(...);       /* = divider do MUI */
  --color-input: oklch(...);
  --color-ring: oklch(...);

  /* Tipografia */
  --font-sans: '[PREENCHER font-family do MUI]', system-ui, sans-serif;

  /* Border radius (converter do MUI shape.borderRadius) */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;

  /* Breakpoints (equivalentes aos do MUI) */
  --breakpoint-sm: 600px;
  --breakpoint-md: 900px;
  --breakpoint-lg: 1200px;
  --breakpoint-xl: 1536px;
}

/* Dark mode (se aplicável) */
.dark {
  --color-background: oklch(...);
  --color-card: oklch(...);
  /* ... todas as cores do dark theme do MUI */
}
```

### 1.4 — Criar utilitário cn()

```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## FASE 2: MIGRAÇÃO COMPONENTE A COMPONENTE

### Processo para CADA componente:

Para cada componente MUI sendo migrado, siga este checklist:

#### 2.1 — Criar o componente shadcn/Tailwind equivalente

```bash
# Se disponível no shadcn:
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add dialog
# etc.

# Se não disponível: criar manualmente em components/ui/
```

#### 2.2 — Criar adapter/wrapper se necessário

Se a API do componente MUI for muito diferente, crie um wrapper que mantém a mesma interface:

```typescript
// components/ui/text-field.tsx
// Migrado de: MUI <TextField>
// Equivalência: <TextField label="..." variant="outlined" error helperText="..." />

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: boolean;
  helperText?: string;
  fullWidth?: boolean; // compatibilidade com API MUI
}

export function TextField({
  label,
  error,
  helperText,
  fullWidth,
  className,
  id,
  ...props
}: TextFieldProps) {
  const inputId = id || label.toLowerCase().replace(/\s/g, '-');

  return (
    <div className={cn('space-y-2', fullWidth && 'w-full', className)}>
      <Label htmlFor={inputId}>{label}</Label>
      <Input
        id={inputId}
        className={cn(error && 'border-destructive focus-visible:ring-destructive')}
        {...props}
      />
      {helperText && (
        <p className={cn('text-sm', error ? 'text-destructive' : 'text-muted-foreground')}>
          {helperText}
        </p>
      )}
    </div>
  );
}
```

#### 2.3 — Substituir imports progressivamente

```typescript
// ANTES:
import { Button } from '@mui/material'; // ou import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';

// DEPOIS:
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
```

#### 2.4 — Converter props MUI para Tailwind/shadcn

Mapeamento de props comuns:

```
MUI prop                    → Tailwind/shadcn equivalente
─────────────────────────────────────────────────────────
variant="contained"         → variant="default"
variant="outlined"          → variant="outline"
variant="text"              → variant="ghost"
color="primary"             → (default, já é primary)
color="secondary"           → variant="secondary"
color="error"               → variant="destructive"
size="small"                → size="sm"
size="medium"               → size="default"
size="large"                → size="lg"
fullWidth                   → className="w-full"
disabled                    → disabled (mesmo)
startIcon={<Icon/>}         → <Icon className="mr-2 h-4 w-4" /> dentro do Button
endIcon={<Icon/>}           → <Icon className="ml-2 h-4 w-4" /> dentro do Button
sx={{ mt: 2, px: 3 }}      → className="mt-4 px-6" (MUI spacing * 2 = Tailwind rem*4)
onClick                     → onClick (mesmo)
```

#### 2.5 — Converter layouts MUI

```typescript
// Box → div com classes
<Box sx={{ display: 'flex', gap: 2, p: 3 }}>     →  <div className="flex gap-4 p-6">
<Box sx={{ mt: 2, mb: 1 }}>                       →  <div className="mt-4 mb-2">

// Stack → div flex
<Stack direction="row" spacing={2}>                →  <div className="flex flex-row gap-4">
<Stack direction="column" spacing={1}>             →  <div className="flex flex-col gap-2">

// Grid → CSS Grid ou flex
<Grid container spacing={2}>                       →  <div className="grid grid-cols-12 gap-4">
<Grid item xs={12} md={6}>                         →  <div className="col-span-12 md:col-span-6">

// Container → div com max-width
<Container maxWidth="lg">                          →  <div className="mx-auto max-w-7xl px-4">

// Typography → elementos HTML + classes
<Typography variant="h1">                          →  <h1 className="text-4xl font-bold tracking-tight">
<Typography variant="body1">                       →  <p className="text-base leading-7">
<Typography variant="caption" color="text.secondary"> → <span className="text-sm text-muted-foreground">
```

**IMPORTANTE sobre spacing:** O MUI usa fator 8px por padrão (spacing(1) = 8px, spacing(2) = 16px). O Tailwind usa fator 4px (p-1 = 4px, p-2 = 8px). Então `sx={{ p: 2 }}` (16px) = `p-4` no Tailwind.

---

## FASE 3: MIGRAÇÃO DE ÍCONES

### Mapeamento @mui/icons-material → lucide-react

Crie um arquivo de mapeamento:

```typescript
// src/lib/icon-map.ts
// Referência de migração de ícones MUI → Lucide
//
// MUI Icon                → Lucide Icon
// ─────────────────────────────────────
// Add                     → Plus
// ArrowBack               → ArrowLeft
// ArrowForward            → ArrowRight
// Check                   → Check
// ChevronLeft             → ChevronLeft
// ChevronRight            → ChevronRight
// Close                   → X
// ContentCopy             → Copy
// Delete                  → Trash2
// Edit                    → Pencil
// Email                   → Mail
// Error                   → AlertCircle
// ExpandMore              → ChevronDown
// Favorite                → Heart
// FilterList              → Filter
// Home                    → Home
// Info                    → Info
// Menu                    → Menu
// MoreVert                → MoreVertical
// Notifications           → Bell
// Person                  → User
// Phone                   → Phone
// Refresh                 → RefreshCw
// Search                  → Search
// Settings                → Settings
// Star                    → Star
// Visibility              → Eye
// VisibilityOff           → EyeOff
// Warning                 → AlertTriangle
//
// Buscar mais em: https://lucide.dev/icons/
```

Pattern de substituição:

```typescript
// ANTES (MUI):
import DeleteIcon from '@mui/icons-material/Delete';
<Button startIcon={<DeleteIcon />}>Deletar</Button>

// DEPOIS (Lucide):
import { Trash2 } from 'lucide-react';
<Button><Trash2 className="mr-2 h-4 w-4" />Deletar</Button>
```

---

## FASE 4: MIGRAÇÃO DE HOOKS MUI

```typescript
// useMediaQuery
// ANTES:
import { useMediaQuery, useTheme } from '@mui/material';
const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down('md'));

// DEPOIS (hook customizado):
// src/hooks/use-media-query.ts
import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

// Uso:
const isMobile = useMediaQuery('(max-width: 899px)'); // equivalente ao md do MUI
```

---

## FASE 5: COMPONENTES COMPLEXOS (sem equivalente direto)

### DataGrid → TanStack Table

Se o projeto usa `@mui/x-data-grid`, migrar para TanStack Table v8 com componentes shadcn:

```bash
npx shadcn@latest add table
npm install @tanstack/react-table
```

O shadcn/ui tem um exemplo completo de DataTable com sorting, filtering, pagination e selection: https://ui.shadcn.com/docs/components/data-table

### DatePicker

```bash
npx shadcn@latest add calendar
npx shadcn@latest add popover
npm install date-fns  # ou dayjs se já usa
```

### Stepper (não existe no shadcn — criar customizado)

Criar componente `Stepper` customizado usando CVA + Tailwind.

---

## FASE 6: LIMPEZA FINAL

### 6.1 — Verificar que nenhum import MUI restou

```bash
# Rodar no terminal para encontrar imports remanescentes:
grep -r "@mui" src/ --include="*.tsx" --include="*.ts" -l
grep -r "@emotion" src/ --include="*.tsx" --include="*.ts" -l
grep -r "makeStyles\|styled(" src/ --include="*.tsx" --include="*.ts" -l
```

### 6.2 — Remover dependências MUI

```bash
npm uninstall @mui/material @mui/system @mui/icons-material @mui/lab \
  @mui/x-data-grid @mui/x-date-pickers \
  @emotion/react @emotion/styled @emotion/cache
```

### 6.3 — Limpar configuração Vite

Remover `optimizeDeps` do MUI/Emotion do `vite.config.ts`.

### 6.4 — Audit de bundle size

```bash
# Instalar visualizador
npm install -D rollup-plugin-visualizer

# Adicionar ao vite.config.ts e rodar build
npm run build
```

Comparar bundle antes vs depois da migração.

### 6.5 — Testar Core Web Vitals

- Rodar Lighthouse em todas as páginas principais
- Comparar métricas LCP, FID/INP, CLS antes vs depois
- Documentar ganhos

---

## CHECKLIST FINAL POR COMPONENTE

Para cada componente migrado, confirme:

- [ ] Funcionalidade 100% equivalente
- [ ] TypeScript strict (sem `any`, props tipadas)
- [ ] Acessibilidade mantida (WAI-ARIA, keyboard nav, focus management)
- [ ] Responsividade mantida (todos os breakpoints)
- [ ] Dark mode funcionando (se aplicável)
- [ ] Nenhum `sx`, `styled()` ou import MUI restante
- [ ] Componentizado (sem classes Tailwind soltas em páginas)
- [ ] Comentário de equivalência MUI no topo do arquivo

---

## INFORMAÇÕES DO MEU PROJETO

[PREENCHER ABAIXO COM OS DADOS DO SEU PROJETO]

### Estrutura de pastas atual:
```
src/
├── components/
│   ├── [PREENCHER]
├── pages/ (ou views/)
│   ├── [PREENCHER]
├── hooks/
├── services/
├── theme/
│   └── [PREENCHER: arquivo de tema MUI]
├── App.tsx
└── main.tsx
```

### Componentes MUI mais usados (top 10):
1. [PREENCHER]
2. [PREENCHER]
3. [PREENCHER]
4. [PREENCHER]
5. [PREENCHER]
6. [PREENCHER]
7. [PREENCHER]
8. [PREENCHER]
9. [PREENCHER]
10. [PREENCHER]

### Padrão de estilização predominante:
[PREENCHER: sx prop / styled / makeStyles / mix]

### Tem dark mode?
[PREENCHER: Sim/Não]

### Tema customizado?
[PREENCHER: Sim/Não — se sim, colar o createTheme() completo]

### Libs MUI extras:
[PREENCHER: @mui/x-data-grid, @mui/x-date-pickers, @mui/lab, etc.]

### Quantidade aproximada de arquivos/componentes:
[PREENCHER]

### Prazo desejado:
[PREENCHER]

---

## INSTRUÇÕES FINAIS PARA A IA

1. **Comece pela Fase 0** — faça o inventário completo antes de tocar em qualquer código.

2. **Trabalhe por waves** — complete uma wave inteira antes de começar a próxima. Cada wave deve deixar o sistema funcional.

3. **Mostre o antes/depois** para cada componente migrado, incluindo os imports.

4. **Alerte-me** se encontrar algum componente MUI que não tenha equivalente direto e precise de implementação customizada.

5. **Documente** toda decisão técnica que divergir do padrão MUI original.

6. **Priorize manter a API dos componentes o mais próxima possível do MUI** nas primeiras waves, para minimizar mudanças nos arquivos de página. Refatorações de API podem ser feitas depois.

7. **Nunca remova o MUI de áreas que ainda não foram migradas.** A coexistência é obrigatória até a Wave 6.
