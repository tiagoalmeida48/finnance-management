import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Button,
  Checkbox,
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
    : baseSchema.extend({
        password: z
          .string()
          .min(12, 'A senha deve ter ao menos 12 caracteres.')
          .max(128, 'A senha deve ter no máximo 128 caracteres.'),
      });

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

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2"
        >
          <div>
            <Label htmlFor="user-full-name">Nome completo</Label>
            <Input id="user-full-name" className="w-full" {...register('fullName')} />
          </div>

          <div>
            <Label htmlFor="user-email">E-mail</Label>
            <Input id="user-email" type="email" className="w-full" {...register('email')} />
            {errors.email && <p className="text-expense text-xs mt-1">{errors.email.message}</p>}
          </div>

          {!isEditing && (
            <div className="sm:col-span-2">
              <Label htmlFor="user-password">Senha inicial</Label>
              <Input
                id="user-password"
                type="password"
                className="w-full"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-expense text-xs mt-1">{errors.password.message}</p>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 sm:col-span-2">
            <Checkbox id="user-is-admin" {...register('isAdmin')} />
            <Label htmlFor="user-is-admin" className="mb-0">
              Usuário administrador
            </Label>
          </div>

          <DialogFooter className="sm:col-span-2">
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
