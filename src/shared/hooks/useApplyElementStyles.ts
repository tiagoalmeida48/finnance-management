import { useCallback, useMemo } from 'react';

type StyleValue = string | number | null | undefined;

const toCssValue = (value: StyleValue) => {
    if (value === null || value === undefined) return null;
    return String(value);
};

export function useApplyElementStyles<T extends HTMLElement>(styles: Record<string, StyleValue>) {
    const entries = useMemo(
        () => Object.entries(styles).map(([key, value]) => [key, toCssValue(value)] as [string, string | null]),
        [styles],
    );

    return useCallback((node: T | null) => {
        if (!node) return;

        entries.forEach(([key, value]) => {
            if (!value) {
                node.style.removeProperty(key);
                return;
            }
            node.style.setProperty(key, value);
        });
    }, [entries]);
}
