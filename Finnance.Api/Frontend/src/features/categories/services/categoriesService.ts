import { apiClient } from '@/config/http';
import type {
  Category,
  CategoryType,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../types/categories.types';

export const categoriesService = {
  list: async (): Promise<Category[]> => {
    return apiClient.get<Category[]>('/category/list');
  },

  get: async (category: number): Promise<Category> => {
    return apiClient.get<Category>('/category/get', { category });
  },

  create: async (input: CreateCategoryInput): Promise<number> => {
    return apiClient.post<number>('/category/create', input);
  },

  update: async (input: UpdateCategoryInput): Promise<boolean> => {
    return apiClient.put<boolean>('/category/update', input);
  },

  remove: async (category: number): Promise<boolean> => {
    return apiClient.delete<boolean>('/category/delete', category);
  },

  listTypes: async (): Promise<CategoryType[]> => {
    return apiClient.get<CategoryType[]>('/category-type/list');
  },
};
