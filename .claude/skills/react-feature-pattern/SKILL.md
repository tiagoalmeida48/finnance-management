---
name: react-feature-pattern
description: Enforces the project's specific React patterns for features, focusing on logic extraction, atomic components, and strict architectural standards. Use when creating new pages, features, or refactoring existing ones ("nova pagina", "refatorar", "criar feature", "novo componente").
---

# React Feature Pattern

This skill enforces the `finnance-management` project's specific architectural and coding patterns. It facilitates the creation of consistent, maintainable, and clean React features.

## When to Use This Skill

- Creating new features or pages (e.g., "Create a Budget page").
- Refactoring existing components to match project standards.
- Ensuring consistency in UI/UX and logic separation.
- Triggers: "nova pagina", "criar feature", "refatorar seguindo padrao", "novo modulo".

## Core Principles

1.  **Strict Logic Separation**:
    - **Never** write logic inside the UI component.
    - Always create a custom hook (e.g., `usePageLogic`, `useFormLogic`) to handle state, effects, and handlers.
    - The UI component should only receive data and functions from the hook.

2.  **Atomic & Shared Components**:
    - Use the project's shared design system components (`@/shared/components/*`).
    - Do not create ad-hoc HTML/CSS structures if a shared component exists (e.g., use `Stack`, `Row`, `Grid` instead of `div` with flex classes where possible, or use tailwind classes on standard elements if it makes more sense for layout).
    - Common components to use:
        - `PageHeader`: For page titles and main actions.
        - `CollectionState`: For lists handling loading/empty states.
        - `FormDialog`: For modal forms.
        - `ActionMenuPopover` & `EditDeleteMenuActions`: For item actions.
        - `DeleteConfirmationModal`: For standard delete flows.

3.  **Internationalization**:
    - **Never** hardcode strings.
    - Always use the `messages` object from `@/shared/i18n/messages`.

4.  **Forms**:
    - Use `react-hook-form` integrated into the logic hook.
    - UI components should use `Controller` or `register` passed from the hook.

5.  **Styling**:
    - Use Tailwind CSS for static styling.
    - Use `useApplyElementStyles` hook for dynamic styles (e.g., dynamic colors based on data).

## Folder Structure

Follow this directory structure for new features:

```text
src/pages/[feature-name]/
├── [Feature]Page.tsx        # Main container (e.g., AccountsPage.tsx)
├── components/              # Feature-specific components
│   ├── [Feature]Card.tsx    # List item component
│   ├── [Feature]Form.tsx    # Form component (Modal/Page)
│   └── ...
```

## Implementation Guide

### Step 1: Create the Logic Hook

Create the hook in `@/shared/hooks/` (or strictly scoped feature hooks if preferred, but general pattern suggests shared/hooks based on imports).

**Pattern:**
```typescript
import { useState } from 'react';
// ... imports

export function useFeaturePageLogic() {
    // State
    const [modalOpen, setModalOpen] = useState(false);
    
    // Query / Mutation hooks
    const { data, isLoading } = useQuery(...);

    // Handlers
    const handleAdd = () => setModalOpen(true);
    
    return {
        data,
        isLoading,
        modalOpen,
        setModalOpen,
        handleAdd,
        // ... export everything needed by UI
    };
}
```

### Step 2: Create the Main Page Component

**Pattern:**
```typescript
import { useFeaturePageLogic } from '@/shared/hooks/useFeaturePageLogic';
import { PageHeader } from '@/shared/components/PageHeader';
import { CollectionState } from '@/shared/components/CollectionState';
// ... imports

export function FeaturePage() {
    const { 
        data, isLoading, handleAdd 
    } = useFeaturePageLogic();
    const pageMessages = messages.feature.page;

    return (
        <Section>
            <Container>
                <PageHeader
                    title={pageMessages.title}
                    actions={<Button onClick={handleAdd}>{pageMessages.newButton}</Button>}
                />
                
                <Grid>
                    <CollectionState isLoading={isLoading} isEmpty={!data?.length}>
                        {data?.map(item => (
                            <FeatureCard key={item.id} item={item} />
                        ))}
                    </CollectionState>
                </Grid>
                
                {/* Modals placed at bottom */}
            </Container>
        </Section>
    );
}
```

### Step 3: Create Sub-Components (Cards, Forms)

**Card Pattern:**
- Receive `item` as prop.
- Use `useApplyElementStyles` for dynamic CSS variables/styles.
- Use `messages` for labels.

**Form Pattern:**
- Use `FormDialog` wrapper.
- Receive `control`, `register`, `errors`, `isSaving` from a `useFormLogic` hook.
- Use `FormField` for layout and error handling.

## Code Quality Standards

- **Zero Comments**: Do not leave comments explaining usage. Code must be self-explanatory.
- **Max Lines**: Keep files under 300 lines.
- **Imports**: Use aliases (`@/shared/...`).
