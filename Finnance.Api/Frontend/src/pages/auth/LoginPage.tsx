import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Gem, Wallet, PieChart, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { Button, Input, Label } from '@/shared/components/ui';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Informe a senha.').max(128, 'Senha inválida.'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const highlights = [
  { icon: Wallet, title: 'Contas e cartões', text: 'Saldos, faturas e limites num só lugar.' },
  { icon: PieChart, title: 'Visão clara', text: 'Receitas e despesas por categoria, sempre atualizadas.' },
  { icon: ShieldCheck, title: 'Seus dados, seguros', text: 'Autenticação protegida e privacidade em primeiro lugar.' },
];

export function LoginPage() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-surface p-12 lg:flex">
        <div className="absolute inset-0 ring-grid opacity-60" />
        <div className="animate-float-slow pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-0 h-80 w-80 rounded-full bg-transfer/15 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-soft to-primary text-bg shadow-glow">
            <Gem size={22} strokeWidth={2.4} />
          </div>
          <span className="text-xl font-bold tracking-tight text-gradient-gold">Finnance</span>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-4xl font-bold leading-tight tracking-tight text-text">
            Suas finanças,{' '}
            <span className="text-gradient-gold">organizadas e sob controle.</span>
          </h2>
          <p className="mt-4 text-text-muted">
            Acompanhe contas, cartões, salário e investimentos com uma visão clara do seu dinheiro.
          </p>

          <ul className="mt-10 space-y-5">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.title} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-text">{item.title}</p>
                    <p className="text-sm text-text-muted">{item.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="relative text-xs text-text-muted">© 2026 Finnance · Gestão Financeira Pessoal</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-soft to-primary text-bg shadow-glow">
              <Gem size={20} strokeWidth={2.4} />
            </div>
            <span className="text-lg font-bold tracking-tight text-gradient-gold">Finnance</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-text">Bem-vindo de volta</h1>
          <p className="mt-1.5 text-sm text-text-muted">Entre com suas credenciais para continuar.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
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

            <Button type="submit" size="lg" className="w-full" loading={isLoading}>
              Entrar
            </Button>

            <div className="flex flex-col items-center justify-between gap-2 text-center text-sm text-text-muted sm:flex-row sm:text-left">
              <Link to="/forgot-password" className="hover:text-text">
                Esqueci minha senha
              </Link>
              <span>O acesso é criado após a confirmação da assinatura.</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
