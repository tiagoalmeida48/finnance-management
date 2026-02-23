import type { ReactNode } from 'react';

interface CollectionStateProps {
    isLoading: boolean;
    isEmpty: boolean;
    loadingFallback?: ReactNode;
    emptyFallback?: ReactNode;
    children: ReactNode;
}

export function CollectionState({
    isLoading,
    isEmpty,
    loadingFallback = <p>Carregando...</p>,
    emptyFallback = null,
    children,
}: CollectionStateProps) {
    if (isLoading) return <>{loadingFallback}</>;
    if (isEmpty) return <>{emptyFallback}</>;
    return <>{children}</>;
}
