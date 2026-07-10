import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '@/features/auth/services/authService';
import { useToast } from '@/shared/components/feedback';
import { Button, Input, Label } from '@/shared/components/ui';
import { AuthShell } from './AuthShell';

const schema = z.object({
  password: z
    .string()
    .min(12, 'A senha deve ter ao menos 12 caracteres.')
    .max(128, 'A senha deve ter no máximo 128 caracteres.'),
});
type FormData = z.infer<typeof schema>;

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (token) window.history.replaceState({}, document.title, '/reset-password');
  }, [token]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await authService.resetPassword(token, data.password);
      addToast('Senha redefinida. Faça login.', 'success');
      navigate('/login');
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Erro ao redefinir senha.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthShell title="Link inválido">
        <p className="text-sm text-text-muted">
          O link de redefinição é inválido. Solicite um novo em{' '}
          <Link to="/forgot-password" className="text-primary hover:underline">
            esqueci minha senha
          </Link>
          .
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Nova senha" subtitle="Defina sua nova senha de acesso.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password">Nova senha</Label>
          <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
          {errors.password && <p className="text-sm text-expense">{errors.password.message}</p>}
        </div>
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Redefinir senha
        </Button>
      </form>
    </AuthShell>
  );
}
