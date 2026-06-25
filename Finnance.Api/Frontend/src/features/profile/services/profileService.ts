import { apiClient } from '@/config/http';
import type {
  ProfileInfo,
  UpdatePasswordInput,
  UpdateProfileInput,
} from '../types/profile.types';

export const profileService = {
  me: (): Promise<ProfileInfo> => apiClient.get<ProfileInfo>('/auth/me'),

  update: (input: UpdateProfileInput): Promise<boolean> =>
    apiClient.put<boolean>('/user/update-profile', input),

  updatePassword: (input: UpdatePasswordInput): Promise<boolean> =>
    apiClient.put<boolean>('/user/update-my-password', input),
};
