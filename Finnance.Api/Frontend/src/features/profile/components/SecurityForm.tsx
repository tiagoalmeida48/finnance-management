import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';
import { Button, Card, CardContent, Input, Label } from '@/shared/components/ui';
import type { PasswordFormValues } from '../constants';

interface SecurityFormProps {
  form: UseFormReturn<PasswordFormValues>;
  saving: boolean;
  onSubmit: () => void;
}

export function SecurityForm({ form, saving, onSubmit }: SecurityFormProps) {
  const [show, setShow] = useState(false);
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <Card className="h-full">
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-primary" />
          <h2 className="text-lg font-bold text-text">Segurança</h2>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="profile-current-password">Senha atual</Label>
            <div className="relative">
              <Lock
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <Input
                id="profile-current-password"
                type={show ? 'text' : 'password'}
                autoComplete="current-password"
                className="w-full pl-9"
                {...register('currentPassword')}
              />
            </div>
            {errors.currentPassword && (
              <p className="text-expense text-sm mt-1">{errors.currentPassword.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="profile-password">Nova senha</Label>
            <div className="relative">
              <Lock
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <Input
                id="profile-password"
                type={show ? 'text' : 'password'}
                autoComplete="new-password"
                className="w-full pl-9 pr-10"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShow((value) => !value)}
                aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-expense text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="profile-password-confirm">Confirmar nova senha</Label>
            <div className="relative">
              <Lock
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <Input
                id="profile-password-confirm"
                type={show ? 'text' : 'password'}
                autoComplete="new-password"
                className="w-full pl-9"
                {...register('confirmPassword')}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-expense text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" loading={saving}>
            <ShieldCheck size={18} className="mr-2" />
            Atualizar senha
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
