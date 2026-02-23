import { useEffect, RefObject } from 'react';

type Handler = (event: MouseEvent | TouchEvent) => void;

export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
    ref: RefObject<T | null>,
    handler: Handler,
    excludeRefs: RefObject<HTMLElement | null>[] = []
): void {
    useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            const el = ref?.current;

            // Do nothing if clicking ref's element or descendent elements
            if (!el || el.contains(event.target as Node)) {
                return;
            }

            // Do nothing if clicking on any of the excluded refs
            for (const excludeRef of excludeRefs) {
                if (excludeRef?.current?.contains(event.target as Node)) {
                    return;
                }
            }

            handler(event);
        };

        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);

        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler, excludeRefs]);
}
