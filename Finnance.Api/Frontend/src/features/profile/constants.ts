import { z } from 'zod';

export const personalInfoSchema = z.object({
  fullName: z.string().trim().min(1, 'Informe o nome completo.'),
});

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Informe a senha atual.').max(128, 'Senha inválida.'),
    password: z
      .string()
      .min(12, 'A senha deve ter ao menos 12 caracteres.')
      .max(128, 'A senha deve ter no máximo 128 caracteres.'),
    confirmPassword: z.string().min(1, 'Confirme a nova senha.'),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'As senhas não coincidem.',
      });
    }
  });

export const marketingPreferencesSchema = z
  .object({
    phone: z.string().trim(),
    marketingConsent: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const digitCount = data.phone.replace(/\D/g, '').length;
    if (data.phone && (digitCount < 10 || digitCount > 15)) {
      ctx.addIssue({
        code: 'custom',
        path: ['phone'],
        message: 'Informe um telefone válido com DDD.',
      });
    }

    if (data.marketingConsent && !data.phone) {
      ctx.addIssue({
        code: 'custom',
        path: ['phone'],
        message: 'Informe um telefone para autorizar as comunicações.',
      });
    }
  });

export type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;
export type PasswordFormValues = z.infer<typeof passwordSchema>;
export type MarketingPreferencesFormValues = z.infer<typeof marketingPreferencesSchema>;
