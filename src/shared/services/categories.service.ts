import { z } from 'zod';
import { supabase } from '@/lib/supabase/client';
import { Category } from '../interfaces';
import { CategorySchema } from '../schemas';

export const categoriesService = {
  async getAll() {
<<<<<<< HEAD
    const { data, error } = await supabase.rpc('get_categories');
=======
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .is('deleted_at', null)
      .order('name');

>>>>>>> finnance-management/main
    if (error) throw error;
    return z.array(CategorySchema).parse(data);
  },

  async create(
    category: Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_active'>,
  ) {
<<<<<<< HEAD
    const { data, error } = await supabase.rpc('create_category', {
      p_name: category.name,
      p_type: category.type,
      p_color: category.color ?? null,
      p_icon: category.icon ?? null,
    });
=======
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('categories')
      .insert({ ...category, user_id: user.id, is_active: true })
      .select()
      .single();

>>>>>>> finnance-management/main
    if (error) throw error;
    return CategorySchema.parse(data);
  },

  async update(id: string, updates: Partial<Category>) {
<<<<<<< HEAD
    const { data, error } = await supabase.rpc('update_category', {
      p_id: id,
      p_name: updates.name ?? null,
      p_type: updates.type ?? null,
      p_color: updates.color ?? null,
      p_icon: updates.icon ?? null,
    });
=======
    const { data, error } = await supabase
      .from('categories')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

>>>>>>> finnance-management/main
    if (error) throw error;
    return CategorySchema.parse(data);
  },

  async delete(id: string) {
<<<<<<< HEAD
    const { error } = await supabase.rpc('delete_category', { p_id: id });
=======
    const { error } = await supabase
      .from('categories')
      .update({ deleted_at: new Date().toISOString(), is_active: false })
      .eq('id', id);

>>>>>>> finnance-management/main
    if (error) throw error;
  },
};
