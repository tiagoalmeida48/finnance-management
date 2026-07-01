import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '@/features/auth/services/authService';
import { Button, Input, Label } from '@/shared/components/ui';
import { AuthShell } from './AuthShell';

const schema = z.object({ email: z.string().email('Email inválido') });
type FormData = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await authService.forgotPassword(data.email);
    } finally {
      setLoading(false);
      setDone(true);
    }
  };

  if (done) {
    return (
      <AuthShell title="Verifique seu e-mail">
        <p className="text-sm text-text-muted">
          Se o e-mail existir, enviamos um link para redefinir sua senha.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Esqueci minha senha" subtitle="Enviaremos um link de redefinição.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="seu@email.com" {...register('email')} />
          {errors.email && <p className="text-sm text-expense">{errors.email.message}</p>}
        </div>
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Enviar link
        </Button>
      </form>
    </AuthShell>
  );
}
