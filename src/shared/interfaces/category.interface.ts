export type CategoryType = 'income' | 'expense';

export interface Category {
    id: string;
    user_id: string;
    name: string;
    type: CategoryType;
    icon: string;
    color: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}
