import { useCallback, useEffect, useMemo, useState } from 'react';
import { SiteBrandingContext, SiteBranding } from './site-branding-context-object';
import { defaultSiteBranding, fetchSiteBranding, saveSiteBranding } from '@/shared/services/site-branding.service';

const DEFAULT_BRANDING: SiteBranding = defaultSiteBranding;

export function SiteBrandingProvider({ children }: { children: React.ReactNode }) {
    const [branding, setBranding] = useState<SiteBranding>(DEFAULT_BRANDING);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let mounted = true;

        const loadBranding = async () => {
            try {
                const data = await fetchSiteBranding();
                if (mounted) {
                    setBranding(data);
                }
            } catch (error) {
                console.error('Error loading site branding:', error);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadBranding();

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        document.title = branding.siteTitle;
    }, [branding.siteTitle]);

    useEffect(() => {
        const faviconHref = branding.logoImage || '/finnance-icon.svg';
        let favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;

        if (!favicon) {
            favicon = document.createElement('link');
            favicon.rel = 'icon';
            document.head.appendChild(favicon);
        }

        favicon.type = branding.logoImage ? 'image/png' : 'image/svg+xml';
        favicon.href = faviconHref;
    }, [branding.logoImage]);

    const updateBranding = useCallback(async (updates: Partial<SiteBranding>) => {
        const nextTitle = updates.siteTitle !== undefined ? updates.siteTitle.trim() : branding.siteTitle;
        const nextLogoImage = updates.logoImage !== undefined ? updates.logoImage : branding.logoImage;
        const nextBranding: SiteBranding = {
            siteTitle: nextTitle || DEFAULT_BRANDING.siteTitle,
            logoImage: nextLogoImage ?? DEFAULT_BRANDING.logoImage,
        };

        setSaving(true);
        try {
            const saved = await saveSiteBranding(nextBranding);
            setBranding(saved);
        } finally {
            setSaving(false);
        }
    }, [branding.logoImage, branding.siteTitle]);

    const value = useMemo(
        () => ({
            siteTitle: branding.siteTitle,
            logoImage: branding.logoImage,
            loading,
            saving,
            updateBranding,
        }),
        [branding, loading, saving, updateBranding]
    );

    return (
        <SiteBrandingContext.Provider value={value}>
            {children}
        </SiteBrandingContext.Provider>
    );
}
