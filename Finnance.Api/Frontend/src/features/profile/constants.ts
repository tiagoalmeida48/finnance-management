import { z } from 'zod';

export const personalInfoSchema = z.object({
  fullName: z.string().trim().min(1, 'Informe o nome completo.'),
});

export const passwordSchema = z
  .object({
    password: z.string().min(6, 'A senha deve ter ao menos 6 caracteres.'),
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

export type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;
export type PasswordFormValues = z.infer<typeof passwordSchema>;
