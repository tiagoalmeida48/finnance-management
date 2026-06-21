import { apiClient } from '@/config/http';
import type { LoginInput, Me, Session } from '../types/auth.types';

export const authService = {
  login: async (input: LoginInput): Promise<Session> => {
    return apiClient.post<Session>('/auth/login', input);
  },

  me: async (): Promise<Me> => {
    return apiClient.get<Me>('/auth/me');
  },
};
