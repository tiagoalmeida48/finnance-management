import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { authService } from '@/features/auth/services/authService';
import { useToast } from '@/shared/components/feedback';
import { Button, Input, Label } from '@/shared/components/ui';
import { AuthShell } from './AuthShell';

const schema = z.object({
  fullName: z.string().min(1, 'Informe seu nome'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

type FormData = z.infer<typeof schema>;

export function RegisterPage() {
  const { addToast } = useToast();
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
      await authService.register(data);
      setDone(true);
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Erro ao criar conta.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <AuthShell title="Confirme seu e-mail" subtitle="Conta criada com sucesso.">
        <p className="text-sm text-text-muted">
          Enviamos um link de confirmação para seu e-mail. Confirme para poder entrar.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Criar conta"
      subtitle="Comece a organizar suas finanças."
      footer={
        <>
          Já tem conta?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Nome</Label>
          <Input id="fullName" placeholder="Seu nome" {...register('fullName')} />
          {errors.fullName && <p className="text-sm text-expense">{errors.fullName.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="seu@email.com" {...register('email')} />
          {errors.email && <p className="text-sm text-expense">{errors.email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Senha</Label>
          <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
          {errors.password && <p className="text-sm text-expense">{errors.password.message}</p>}
        </div>
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Criar conta
        </Button>
      </form>
    </AuthShell>
  );
}
