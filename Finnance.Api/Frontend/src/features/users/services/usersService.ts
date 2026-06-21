import { apiClient } from '@/config/http';
import type {
  CreateUserInput,
  ManagedUser,
  UpdateUserInput,
  UpdateUserPasswordInput,
} from '../types/users.types';

export const usersService = {
  list: (): Promise<ManagedUser[]> => apiClient.get<ManagedUser[]>('/user/list'),

  create: (input: CreateUserInput): Promise<number> =>
    apiClient.post<number>('/user/create', input),

  update: (input: UpdateUserInput): Promise<boolean> =>
    apiClient.put<boolean>('/user/update', input),

  updatePassword: (input: UpdateUserPasswordInput): Promise<boolean> =>
    apiClient.put<boolean>('/user/updatePassword', input),

  remove: (user: number): Promise<boolean> => apiClient.delete<boolean>('/user/delete', user),
};
