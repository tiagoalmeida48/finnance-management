import { supabase } from '@/lib/supabase/client';
import { CreditCard, Transaction } from '../interfaces';
import { addMonths, startOfMonth, format } from 'date-fns';

export const cardsService = {
    async getAll() {
        const { data: cards, error } = await supabase
            .from('credit_cards')
            .select('*, bank_account:bank_account_id(name)')
            .is('deleted_at', null)
            .order('name');

        if (error) throw error;

        const { data: transactions, error: transError } = await supabase
            .from('transactions')
            .select('amount, card_id, payment_date, is_paid, type')
            .not('card_id', 'is', null);

        if (transError) throw transError;

        const now = new Date();
        const currentMonthKey = format(now, 'yyyy-MM');

        return (cards as any[]).map(card => {
            const closingDay = Number(card.closing_day);
            const dueDay = Number(card.due_day);
            const isNextMonthPayment = closingDay >= dueDay;

            const cardTransactions = transactions?.filter(t => t.card_id === card.id) || [];

            const totalUsage = cardTransactions
                .filter(t => !t.is_paid)
                .reduce((acc, t) => {
                    const amount = Number(t.amount) || 0;
                    return t.type === 'income' ? acc - amount : acc + amount;
                }, 0);

            const currentInvoice = cardTransactions
                .filter(t => !t.is_paid)
                .reduce((acc, t) => {
                    const date = new Date(t.payment_date + 'T12:00:00');
                    const day = date.getDate();

                    let monthShift = isNextMonthPayment ? 1 : 0;
                    if (day > closingDay) {
                        monthShift += 1;
                    }

                    const statementMonth = addMonths(startOfMonth(date), monthShift);
                    const statementKey = format(statementMonth, 'yyyy-MM');

                    if (statementKey === currentMonthKey) {
                        const amount = Number(t.amount) || 0;
                        return t.type === 'income' ? acc - amount : acc + amount;
                    }
                    return acc;
                }, 0);

            return {
                ...card,
                usage: totalUsage,
                current_invoice: currentInvoice,
                available_limit: Number(card.credit_limit) - totalUsage
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
        const { data: card, error: cardError } = await supabase
            .from('credit_cards')
            .select('*, bank_account:bank_account_id(name)')
            .eq('id', id)
            .single();

        if (cardError) throw cardError;

        const { data: transactions, error: transError } = await supabase
            .from('transactions')
            .select('*, category:category_id(name, color, icon)')
            .eq('card_id', id)
            .order('payment_date', { ascending: false });

        if (transError) throw transError;

        const now = new Date();
        const currentMonthKey = format(now, 'yyyy-MM');

        const closingDay = Number(card.closing_day);
        const dueDay = Number(card.due_day);
        const isNextMonthPayment = closingDay >= dueDay;

        const cardTransactions = (transactions || []) as Transaction[];

        const totalUsage = cardTransactions
            .filter(t => !t.is_paid)
            .reduce((acc, t) => {
                const amount = Number(t.amount) || 0;
                return t.type === 'income' ? acc - amount : acc + amount;
            }, 0);

        const currentInvoice = cardTransactions
            .filter(t => !t.is_paid)
            .reduce((acc, t) => {
                const date = new Date(t.payment_date + 'T12:00:00');
                const day = date.getDate();

                let monthShift = isNextMonthPayment ? 1 : 0;
                if (day > closingDay) {
                    monthShift += 1;
                }

                const statementMonth = addMonths(startOfMonth(date), monthShift);
                const statementKey = format(statementMonth, 'yyyy-MM');

                if (statementKey === currentMonthKey) {
                    const amount = Number(t.amount) || 0;
                    return t.type === 'income' ? acc - amount : acc + amount;
                }
                return acc;
            }, 0);

        return {
            ...(card as CreditCard),
            transactions: cardTransactions,
            usage: totalUsage,
            current_invoice: currentInvoice,
            available_limit: Number(card.credit_limit) - totalUsage
        };
    }
};
