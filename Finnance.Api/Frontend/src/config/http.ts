import axios, { AxiosError } from 'axios';
import { env } from './env';
import { AUTH_TOKEN_KEY } from './constants';
import { ApiError, type ResultApi } from '@/shared/types/api.types';

export const tokenStorage = {
  get: () => localStorage.getItem(AUTH_TOKEN_KEY),
  set: (token: string) => localStorage.setItem(AUTH_TOKEN_KEY, token),
  clear: () => localStorage.removeItem(AUTH_TOKEN_KEY),
};

export const http = axios.create({
  baseURL: env.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

http.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (response) => {
    const payload = response.data as ResultApi<unknown>;
    if (payload && typeof payload === 'object' && 'success' in payload && !payload.success) {
      throw new ApiError(payload.message, response.status, payload.internalError);
    }
    return response;
  },
  (error: AxiosError<ResultApi<unknown>>) => {
    const status = error.response?.status ?? 0;
    const payload = error.response?.data;

    if (status === 401) {
      tokenStorage.clear();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    }

    const message = payload?.message ?? error.message ?? 'Erro inesperado de comunicação com o servidor.';
    return Promise.reject(new ApiError(message, status, payload?.internalError ?? 0));
  },
);

function unwrap<T>(payload: ResultApi<T>): T {
  return payload.result;
}

export const apiClient = {
  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const { data } = await http.get<ResultApi<T>>(url, { params });
    return unwrap(data);
  },
  async post<T>(url: string, body?: unknown): Promise<T> {
    const { data } = await http.post<ResultApi<T>>(url, body);
    return unwrap(data);
  },
  async put<T>(url: string, body?: unknown): Promise<T> {
    const { data } = await http.put<ResultApi<T>>(url, body);
    return unwrap(data);
  },
  async delete<T>(url: string, body?: unknown): Promise<T> {
    const { data } = await http.delete<ResultApi<T>>(url, { data: body });
    return unwrap(data);
  },
};
