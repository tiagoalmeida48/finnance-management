import type { UseFormReturn } from 'react-hook-form';
import { Mail, Save, User as UserIcon } from 'lucide-react';
import { Button, Card, CardContent, Input, Label } from '@/shared/components/ui';
import type { PersonalInfoFormValues } from '../constants';

interface PersonalInfoFormProps {
  form: UseFormReturn<PersonalInfoFormValues>;
  email: string;
  saving: boolean;
  onSubmit: () => void;
}

export function PersonalInfoForm({ form, email, saving, onSubmit }: PersonalInfoFormProps) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <Card className="h-full">
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <UserIcon size={18} className="text-primary" />
          <h2 className="text-lg font-bold text-text">Dados da conta</h2>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="profile-fullname">Nome completo</Label>
            <div className="relative">
              <UserIcon
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <Input
                id="profile-fullname"
                className="w-full pl-9"
                placeholder="Seu nome"
                {...register('fullName')}
              />
            </div>
            {errors.fullName && (
              <p className="text-expense text-sm mt-1">{errors.fullName.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="profile-email">E-mail</Label>
            <div className="relative">
              <Mail
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <Input id="profile-email" className="w-full pl-9" disabled value={email} />
            </div>
          </div>

          <Button type="submit" className="w-full" loading={saving}>
            <Save size={18} className="mr-2" />
            Salvar alterações
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
