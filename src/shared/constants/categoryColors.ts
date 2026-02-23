export const CATEGORY_COLORS = {
    error: '#EF4444',
    info: '#3B82F6',
    warning: '#F5A623',
    success: '#10B981',
    primary: '#C9A84C',
} as const;

export const DEFAULT_CATEGORY_SEED = [
    { name: 'Alimentacao', type: 'expense', color: CATEGORY_COLORS.error, icon: 'utensils' },
    { name: 'Moradia', type: 'expense', color: CATEGORY_COLORS.info, icon: 'home' },
    { name: 'Transporte', type: 'expense', color: CATEGORY_COLORS.warning, icon: 'car' },
    { name: 'Lazer', type: 'expense', color: CATEGORY_COLORS.success, icon: 'coffee' },
    { name: 'Salario', type: 'income', color: CATEGORY_COLORS.primary, icon: 'tag' },
] as const;
