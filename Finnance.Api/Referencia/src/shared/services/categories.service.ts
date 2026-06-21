import { z } from 'zod';
import { supabase } from '@/lib/supabase/client';
import { Category } from '../interfaces';
import { CategorySchema } from '../schemas';

export const categoriesService = {
  async getAll() {
    const { data, error } = await supabase.rpc('get_categories');
    if (error) throw error;
    return z.array(CategorySchema).parse(data);
  },

  async create(
    category: Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_active'>,
  ) {
    const { data, error } = await supabase.rpc('create_category', {
      p_name: category.name,
      p_type: category.type,
      p_color: category.color ?? null,
      p_icon: category.icon ?? null,
    });
    if (error) throw error;
    return CategorySchema.parse(data);
  },

  async update(id: string, updates: Partial<Category>) {
    const { data, error } = await supabase.rpc('update_category', {
      p_id: id,
      p_name: updates.name ?? null,
      p_type: updates.type ?? null,
      p_color: updates.color ?? null,
      p_icon: updates.icon ?? null,
    });
    if (error) throw error;
    return CategorySchema.parse(data);
  },

  async delete(id: string) {
    const { error } = await supabase.rpc('delete_category', { p_id: id });
    if (error) throw error;
  },
};
