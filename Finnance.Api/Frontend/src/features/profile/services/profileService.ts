import { apiClient } from '@/config/http';
import type {
  ProfileInfo,
  UpdatePasswordInput,
  UpdateMarketingPreferencesInput,
  UpdateProfileInput,
} from '../types/profile.types';

export const profileService = {
  me: (): Promise<ProfileInfo> => apiClient.get<ProfileInfo>('/auth/me'),

  update: (input: UpdateProfileInput): Promise<boolean> =>
    apiClient.put<boolean>('/user/update-profile', input),

  updatePassword: (input: UpdatePasswordInput): Promise<boolean> =>
    apiClient.put<boolean>('/user/update-my-password', input),

  updateMarketingPreferences: (
    input: UpdateMarketingPreferencesInput,
  ): Promise<boolean> =>
    apiClient.put<boolean>('/user/update-marketing-preferences', input),
};
