import { supabase } from '@/lib/supabase/client';
import { CreditCard } from '@/types/database';

export const cardsService = {
    async getAll() {
        // Enforce exact type for data returning from Supabase
        const { data: cards, error } = await supabase
            .from('credit_cards')
            .select('*, bank_account:bank_account_id(name)')
            .is('deleted_at', null)
            .order('name');

        if (error) throw error;

        // Fetch usage for all cards in a single query
        const { data: usage, error: usageError } = await supabase
            .from('transactions')
            .select('amount, card_id')
            .is('is_paid', false)
            .not('card_id', 'is', null);

        if (usageError) throw usageError;

        // Map usage to cards
        return (cards as any[]).map(card => {
            const cardUsage = usage
                ?.filter(t => t.card_id === card.id)
                .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0;

            return {
                ...card,
                usage: cardUsage,
                available_limit: Number(card.credit_limit) - cardUsage
            };
        });
    },

    async create(card: Omit<CreditCard, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('credit_cards')
            .insert({ ...card, user_id: user.id })
            .select()
            .single();

        if (error) throw error;
        return data as CreditCard;
    },

    async update(id: string, updates: Partial<Omit<CreditCard, 'id' | 'user_id' | 'created_at'>>) {
        const { data, error } = await supabase
            .from('credit_cards')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as CreditCard;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('credit_cards')
            .update({ deleted_at: new Date().toISOString(), is_active: false })
            .eq('id', id);

        if (error) throw error;
    },

    async getCardDetails(id: string) {
        // 1. Get card basic info
        const { data: card, error: cardError } = await supabase
            .from('credit_cards')
            .select('*, bank_account:bank_account_id(name)')
            .eq('id', id)
            .single();

        if (cardError) throw cardError;

        // 2. Get all transactions for this card
        const { data: transactions, error: transError } = await supabase
            .from('transactions')
            .select('*, category:category_id(name, color, icon)')
            .eq('card_id', id)
            .order('payment_date', { ascending: false });

        if (transError) throw transError;

        return {
            ...card,
            transactions: transactions || []
        };
    }
};
