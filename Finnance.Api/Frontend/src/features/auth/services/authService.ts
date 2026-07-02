import { apiClient } from '@/config/http';
import type { LoginInput, Me, Session } from '../types/auth.types';

export const authService = {
  login: async (input: LoginInput): Promise<Session> => {
    return apiClient.post<Session>('/auth/login', input);
  },

  me: async (): Promise<Me> => {
    return apiClient.get<Me>('/auth/me');
  },

  register: async (input: { email: string; fullName: string; password: string }): Promise<number> => {
    return apiClient.post<number>('/auth/register', input);
  },

  verifyEmail: async (token: string): Promise<boolean> => {
    return apiClient.get<boolean>('/auth/verify-email', { token });
  },

  forgotPassword: async (email: string): Promise<boolean> => {
    return apiClient.post<boolean>('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, password: string): Promise<boolean> => {
    return apiClient.post<boolean>('/auth/reset-password', { token, password });
  },
};
