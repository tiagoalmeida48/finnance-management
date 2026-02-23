import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { messages } from '@/shared/i18n/messages';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function useLoginPageLogic() {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const formMethods = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        setError(null);

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            });

            if (authError) {
                console.error('Login error:', authError);
                throw authError;
            }

            navigate('/dashboard');
        } catch (err: any) {
            // Usa mensagem genérica de erro ou a do Supabase se disponível/seguro
            const errorMessage = messages.auth.login.error;
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        formMethods,
        isLoading,
        error,
        onSubmit: formMethods.handleSubmit(onSubmit),
    };
}
