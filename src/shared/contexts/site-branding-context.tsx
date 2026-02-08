import { useCallback, useEffect, useMemo, useState } from 'react';
import { SiteBrandingContext, SiteBranding } from './site-branding-context-object';

const STORAGE_KEY = 'finnance_site_branding';
const DEFAULT_BRANDING: SiteBranding = {
    siteTitle: 'FINNANCE',
    logoImage: null,
};

export function SiteBrandingProvider({ children }: { children: React.ReactNode }) {
    const [branding, setBranding] = useState<SiteBranding>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return DEFAULT_BRANDING;

        try {
            const parsed = JSON.parse(stored) as Partial<SiteBranding>;
            return {
                siteTitle: parsed.siteTitle?.trim() || DEFAULT_BRANDING.siteTitle,
                logoImage: typeof parsed.logoImage === 'string' ? parsed.logoImage : DEFAULT_BRANDING.logoImage,
            };
        } catch {
            return DEFAULT_BRANDING;
        }
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(branding));
    }, [branding]);

    useEffect(() => {
        document.title = branding.siteTitle;
    }, [branding.siteTitle]);

    useEffect(() => {
        const faviconHref = branding.logoImage || '/vite.svg';
        let favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;

        if (!favicon) {
            favicon = document.createElement('link');
            favicon.rel = 'icon';
            document.head.appendChild(favicon);
        }

        favicon.type = branding.logoImage ? 'image/png' : 'image/svg+xml';
        favicon.href = faviconHref;
    }, [branding.logoImage]);

    const updateBranding = useCallback((updates: Partial<SiteBranding>) => {
        setBranding((prev) => {
            const nextTitle = updates.siteTitle !== undefined ? updates.siteTitle.trim() : prev.siteTitle;
            const nextLogoImage = updates.logoImage !== undefined ? updates.logoImage : prev.logoImage;

            return {
                siteTitle: nextTitle || DEFAULT_BRANDING.siteTitle,
                logoImage: nextLogoImage ?? DEFAULT_BRANDING.logoImage,
            };
        });
    }, []);

    const value = useMemo(
        () => ({
            siteTitle: branding.siteTitle,
            logoImage: branding.logoImage,
            updateBranding,
        }),
        [branding, updateBranding]
    );

    return (
        <SiteBrandingContext.Provider value={value}>
            {children}
        </SiteBrandingContext.Provider>
    );
}
