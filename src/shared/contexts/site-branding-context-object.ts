import { createContext } from 'react';

export interface SiteBranding {
    siteTitle: string;
    logoImage: string | null;
}

export interface SiteBrandingContextValue extends SiteBranding {
    updateBranding: (updates: Partial<SiteBranding>) => void;
}

export const SiteBrandingContext = createContext<SiteBrandingContextValue | null>(null);
