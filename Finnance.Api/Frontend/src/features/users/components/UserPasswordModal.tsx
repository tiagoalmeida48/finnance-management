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

const passwordSchema = z.object({
  password: z.string().min(1, 'Informe a nova senha.'),
});

export type UserPasswordValues = z.infer<typeof passwordSchema>;

interface UserPasswordModalProps {
  user: ManagedUser | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: UserPasswordValues) => void;
  submitting?: boolean;
}

export function UserPasswordModal({
  user,
  onOpenChange,
  onSubmit,
  submitting,
}: UserPasswordModalProps) {
  const open = Boolean(user);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserPasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '' },
  });

  useEffect(() => {
    if (open) reset({ password: '' });
  }, [open, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Redefinir senha</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="user-new-password">Nova senha</Label>
            <Input
              id="user-new-password"
              type="password"
              className="w-full"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-expense text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={submitting}>
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
