import { supabase } from '@/lib/supabase/client';

export interface SiteBrandingData {
    siteTitle: string;
    logoImage: string | null;
}

const BRANDING_ROW_ID = 1;
const DEFAULT_BRANDING: SiteBrandingData = {
    siteTitle: 'FINNANCE',
    logoImage: null,
};

const normalizeTitle = (value: string | null | undefined) =>
    value?.trim() || DEFAULT_BRANDING.siteTitle;

export async function fetchSiteBranding(): Promise<SiteBrandingData> {
    const { data, error } = await supabase
        .from('site_branding')
        .select('site_title, logo_image')
        .eq('id', BRANDING_ROW_ID)
        .maybeSingle();

    if (error) throw error;

    if (!data) return DEFAULT_BRANDING;

    return {
        siteTitle: normalizeTitle(data.site_title),
        logoImage: typeof data.logo_image === 'string' ? data.logo_image : null,
    };
}

export async function saveSiteBranding(input: SiteBrandingData): Promise<SiteBrandingData> {
    const payload = {
        id: BRANDING_ROW_ID,
        site_title: normalizeTitle(input.siteTitle),
        logo_image: input.logoImage ?? null,
        updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
        .from('site_branding')
        .upsert(payload, { onConflict: 'id' })
        .select('site_title, logo_image')
        .single();

    if (error) throw error;

    return {
        siteTitle: normalizeTitle(data.site_title),
        logoImage: typeof data.logo_image === 'string' ? data.logo_image : null,
    };
}

export const defaultSiteBranding = DEFAULT_BRANDING;
