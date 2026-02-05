import { supabase } from '@/lib/supabase/client';
import { Category } from '../interfaces';

export const categoriesService = {
    async getAll() {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .is('deleted_at', null)
            .order('name');

        if (error) throw error;
        return data as Category[];
    },

    async create(category: Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_active'>) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('categories')
            .insert({ ...category, user_id: user.id, is_active: true })
            .select()
            .single();

        if (error) throw error;
        return data as Category;
    },

    async update(id: string, updates: Partial<Category>) {
        const { data, error } = await supabase
            .from('categories')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Category;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('categories')
            .update({ deleted_at: new Date().toISOString(), is_active: false })
            .eq('id', id);

        if (error) throw error;
    }
};
