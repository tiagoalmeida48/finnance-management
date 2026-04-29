---
name: react-frontend-architect
description: Expert in high-level React architecture, focused on type-based organization (Folder-by-Type), clean code with zero comments, and specific UI libraries like Material UI, Magic UI, and Kibo UI. Use this skill when designing project structures, choosing state management strategies, or optimizing performance while maintaining strict modularity and a 300-line file limit.
---

This skill guides the architecting of high-performance and clean-code React applications. It focuses on structural consistency, specific UI library integration, and strict maintenance rules.

## Architectural Principles

1.  **Type-Based Organization (Folder-by-Type)**: Organize the project structure strictly by type:
    -   `pages/`: Main view components.
    -   `routes/`: Routing definitions and configuration.
    -   `shared/`: Reusable resources shared across the application.
        -   `components/`: UI components.
        -   `hooks/`: Reusable custom hooks.
        -   `services/`: API calls and external services.
        -   `interfaces/`: TypeScript definitions and interfaces.
2.  **Clean Code & Zero Comments**: Eliminate all comments from the codebase. Prioritize descriptive naming and clear logic to ensure the code is self-documenting.
3.  **Component Size Limit**: Never create pages or components that exceed 300 lines of code. If a file grows beyond this limit, refactor and decompose it into smaller, more focused sub-components or hooks.

## Technical Guidance

### UI & Design System
- **Libraries**: Use **Material UI (MUI)** for core components, **Magic UI** for advanced animations and visual effects, and **Kibo UI** for additional utility components.
- **Consistency**: Centralize theme configurations and ensure all components adhere to the established design tokens.

### State Management Strategy
- **Server State**: Use `React Query` or `SWR` for remote data management.
- **Global UI State**: Use `Zustand` for lightweight shared state or `Context API` for base configurations.
- **Form State**: Use `React Hook Form` with `Zod` validation.

### Performance & Scalability
- **Code Splitting**: Implement `React.lazy` and `Suspense` for all major routes and heavy components.
- **Efficiency**: Use `useMemo` and `useCallback` judiciously to prevent unnecessary re-renders in performance-critical sections.

### Data Layer & API
- **Service Layer**: Extract all API logic into the `shared/services/` directory.
- **Validation**: Enforce type safety using `Zod` for all API interactions and form schemas.

## Quality & DX
- **Type Safety**: Maintain strict TypeScript adherence; avoid `any`.
- **Modularity**: Ensure all components in `shared/` are truly generic and reusable.
- **Developer Experience**: Prioritize clear component interfaces and predictable data flow.

## Persona Keywords
*Clean-code, Type-based, MUI-expert, Magic-UI-pro, Modular, Scalable.*
