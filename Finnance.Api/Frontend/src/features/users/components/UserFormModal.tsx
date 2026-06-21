import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from '@/shared/components/ui';
import type { ManagedUser } from '../types/users.types';

const baseSchema = z.object({
  fullName: z.string().trim(),
  email: z.string().trim().min(1, 'Informe o e-mail.').email('Informe um e-mail válido.'),
  password: z.string(),
  isAdmin: z.boolean(),
});

export type UserFormValues = z.infer<typeof baseSchema>;

interface UserFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: UserFormValues) => void;
  user?: ManagedUser | null;
  submitting?: boolean;
}

const emptyValues: UserFormValues = {
  fullName: '',
  email: '',
  password: '',
  isAdmin: false,
};

export function UserFormModal({
  open,
  onOpenChange,
  onSubmit,
  user,
  submitting,
}: UserFormModalProps) {
  const isEditing = Boolean(user);
  const schema = isEditing
    ? baseSchema
    : baseSchema.extend({ password: z.string().min(1, 'Informe a senha inicial.') });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!open) return;
    if (user) {
      reset({ fullName: user.fullName ?? '', email: user.email, password: '', isAdmin: user.isAdmin });
    } else {
      reset(emptyValues);
    }
  }, [open, user, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar usuário' : 'Novo usuário'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="user-full-name">Nome completo</Label>
            <Input id="user-full-name" className="w-full" {...register('fullName')} />
          </div>

          <div>
            <Label htmlFor="user-email">E-mail</Label>
            <Input id="user-email" type="email" className="w-full" {...register('email')} />
            {errors.email && <p className="text-expense text-sm mt-1">{errors.email.message}</p>}
          </div>

          {!isEditing && (
            <div>
              <Label htmlFor="user-password">Senha inicial</Label>
              <Input
                id="user-password"
                type="password"
                className="w-full"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-expense text-sm mt-1">{errors.password.message}</p>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              id="user-is-admin"
              type="checkbox"
              className="h-4 w-4 accent-primary"
              {...register('isAdmin')}
            />
            <Label htmlFor="user-is-admin" className="mb-0">
              Usuário administrador
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={submitting}>
              {isEditing ? 'Salvar' : 'Criar usuário'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
