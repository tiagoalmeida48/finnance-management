import { supabase } from '@/lib/supabase/client';

const AUTH_EXPIRED_MESSAGE = 'Sessao expirada. Faca login novamente para continuar.';
const TOKEN_REFRESH_THRESHOLD_SECONDS = 60;
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error('Missing Supabase environment variables');
}

type SupabaseFunctionBody = string | Record<string, unknown>;
type HttpErrorWithStatus = Error & { status?: number };
type MaybeSessionToken = string | null | undefined;

type JwtPayload = { exp?: number };

function isJwtLike(token: MaybeSessionToken): token is string {
    if (!token || typeof token !== 'string') return false;
    const segments = token.split('.');
    return segments.length === 3 && token.startsWith('eyJ');
}

function normalizeAccessToken(token: MaybeSessionToken) {
    if (!token || typeof token !== 'string') return null;
    return token.replace(/^Bearer\s+/i, '').trim();
}

function decodeBase64Url(input: string) {
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    const padded = `${base64}${'='.repeat((4 - (base64.length % 4)) % 4)}`;
    return atob(padded);
}

function parseJwtPayload(token: string): JwtPayload | null {
    try {
        const encodedPayload = token.split('.')[1];
        const decodedPayload = decodeBase64Url(encodedPayload);
        return JSON.parse(decodedPayload) as JwtPayload;
    } catch {
        return null;
    }
}

function isExpiredOrNearExpiry(token: string, thresholdSeconds = TOKEN_REFRESH_THRESHOLD_SECONDS) {
    const payload = parseJwtPayload(token);
    const exp = payload?.exp;
    if (!exp || !Number.isFinite(exp)) return false;
    const nowInSeconds = Math.floor(Date.now() / 1000);
    return exp <= nowInSeconds + thresholdSeconds;
}

async function getValidatedAccessTokenOrThrow() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (!data.session?.user) {
        throw new Error(AUTH_EXPIRED_MESSAGE);
    }

    const accessToken = normalizeAccessToken(data.session?.access_token);
    if (!isJwtLike(accessToken) || isExpiredOrNearExpiry(accessToken)) {
        const { data: refreshedData, error: refreshedError } = await supabase.auth.refreshSession();
        if (refreshedError) throw refreshedError;

        const refreshedToken = normalizeAccessToken(refreshedData.session?.access_token);
        if (!isJwtLike(refreshedToken) || isExpiredOrNearExpiry(refreshedToken, 0)) {
            throw new Error(AUTH_EXPIRED_MESSAGE);
        }

        return refreshedToken;
    }

    return accessToken;
}

async function refreshAccessTokenOrThrow() {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;

    const accessToken = normalizeAccessToken(data.session?.access_token);
    if (!isJwtLike(accessToken) || isExpiredOrNearExpiry(accessToken, 0)) {
        throw new Error(AUTH_EXPIRED_MESSAGE);
    }

    return accessToken;
}

function buildFunctionUrl(functionName: string) {
    return `${supabaseUrl}/functions/v1/${functionName}`;
}

function toErrorMessage(payload: unknown, fallback: string) {
    if (payload && typeof payload === 'object' && 'error' in payload) {
        const error = payload.error;
        if (typeof error === 'string' && error.trim()) return error;
    }

    if (payload && typeof payload === 'object' && 'message' in payload) {
        const message = payload.message;
        if (typeof message === 'string' && message.trim()) return message;
    }

    if (typeof payload === 'string' && payload.trim()) {
        return payload;
    }

    return fallback;
}

async function postFunction<TResponse>(
    functionName: string,
    body: SupabaseFunctionBody,
    accessToken: string
) {
    const response = await fetch(buildFunctionUrl(functionName), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            apikey: supabasePublishableKey,
            Authorization: `Bearer ${accessToken}`,
        },
        body: typeof body === 'string' ? body : JSON.stringify(body),
    });

    const responseText = await response.text();
    let parsed: unknown = null;

    if (responseText) {
        try {
            parsed = JSON.parse(responseText);
        } catch {
            parsed = responseText;
        }
    }

    if (!response.ok) {
        const message = toErrorMessage(parsed, `Function ${functionName} failed with status ${response.status}.`);
        const error = new Error(message) as HttpErrorWithStatus;
        error.status = response.status;
        throw error;
    }

    return parsed as TResponse;
}

function isUnauthorizedError(error: unknown): error is HttpErrorWithStatus {
    return Boolean(error && typeof error === 'object' && 'status' in error && (error as HttpErrorWithStatus).status === 401);
}

export async function invokeSupabaseFunction<TResponse>(
    functionName: string,
    body: SupabaseFunctionBody
) {
    const initialToken = await getValidatedAccessTokenOrThrow();

    try {
        return await postFunction<TResponse>(functionName, body, initialToken);
    } catch (error) {
        if (!isUnauthorizedError(error)) {
            throw error;
        }
    }

    const refreshedToken = await refreshAccessTokenOrThrow();

    try {
        return await postFunction<TResponse>(functionName, body, refreshedToken);
    } catch (error) {
        if (isUnauthorizedError(error)) {
            throw new Error(AUTH_EXPIRED_MESSAGE);
        }
        throw error;
    }
}
