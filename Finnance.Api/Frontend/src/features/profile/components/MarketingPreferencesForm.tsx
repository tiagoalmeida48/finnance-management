import type { UseFormReturn } from 'react-hook-form';
import { Megaphone, Phone, Save } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  Checkbox,
  Input,
  Label,
} from '@/shared/components/ui';
import type { MarketingPreferencesFormValues } from '../constants';

interface MarketingPreferencesFormProps {
  form: UseFormReturn<MarketingPreferencesFormValues>;
  saving: boolean;
  onSubmit: () => void;
}

export function MarketingPreferencesForm({
  form,
  saving,
  onSubmit,
}: MarketingPreferencesFormProps) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <Card className="h-full">
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Megaphone size={18} className="text-primary" />
          <h2 className="text-lg font-bold text-text">Comunicações</h2>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="profile-phone">Telefone</Label>
            <div className="relative">
              <Phone
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <Input
                id="profile-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                className="w-full pl-9"
                placeholder="(11) 99999-9999"
                {...register('phone')}
              />
            </div>
            {errors.phone && (
              <p className="text-expense text-sm mt-1">{errors.phone.message}</p>
            )}
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-bg/40 p-3">
            <Checkbox className="mt-0.5" {...register('marketingConsent')} />
            <span className="text-sm leading-relaxed text-text-muted">
              Aceito receber ofertas, novidades e recomendações pelo WhatsApp. Posso
              retirar esta autorização a qualquer momento.
            </span>
          </label>

          <Button type="submit" className="w-full" loading={saving}>
            <Save size={18} className="mr-2" />
            Salvar preferências
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
