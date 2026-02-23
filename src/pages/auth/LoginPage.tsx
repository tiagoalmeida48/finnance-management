import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { useSiteBranding } from '@/shared/hooks/api/useSiteBranding';
import { messages } from '@/shared/i18n/messages';
import { useLoginPageLogic } from '@/pages/auth/hooks/useLoginPageLogic';
import { FormField } from '@/shared/components/forms/FormField';
import { Stack } from '@/shared/components/layout/Stack';
import { Section } from '@/shared/components/layout/Section';
import { FormDialog } from '@/shared/components/composite/FormDialog';

export function LoginPage() {
  const loginMessages = messages.auth.login;
  const { siteTitle } = useSiteBranding();
  const { formMethods, isLoading, error, onSubmit } = useLoginPageLogic();
  const { register, formState: { errors } } = formMethods;

  return (
    <Section className="relative isolate flex min-h-screen items-center overflow-hidden bg-[var(--color-background-alt)] bg-[radial-gradient(circle_at_18%_12%,var(--overlay-primary-12),transparent_38%),radial-gradient(circle_at_78%_82%,var(--overlay-info-09),transparent_32%)] px-4 py-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 origin-top opacity-50 [background-image:linear-gradient(var(--overlay-white-08)_1px,transparent_1px),linear-gradient(90deg,var(--overlay-white-08)_1px,transparent_1px)] [background-size:34px_34px] [transform:perspective(1200px)_rotateX(20deg)_scale(1.25)]"
      />

      <FormDialog
        open={true}
        onClose={() => { }}
        title={siteTitle}
        onSubmit={onSubmit}
        maxWidth="xs"
        actions={
          <Button
            fullWidth
            variant="contained"
            size="large"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? loginMessages.loading : loginMessages.submit}
          </Button>
        }
      >
        <Stack className="gap-4">
          {error && (
            <Stack className="rounded-md border border-[color:color-mix(in_oklab,var(--color-error)_45%,transparent)] bg-[color:color-mix(in_oklab,var(--color-error)_20%,transparent)] p-3 text-sm text-red-100">
              {error}
            </Stack>
          )}

          <FormField
            htmlFor="login-email"
            label={loginMessages.emailLabel}
            errorMessage={errors.email?.message}
          >
            <Input
              id="login-email"
              type="email"
              {...register('email')}
            />
          </FormField>

          <FormField
            htmlFor="login-password"
            label={loginMessages.passwordLabel}
            errorMessage={errors.password?.message}
          >
            <Input
              id="login-password"
              type="password"
              {...register('password')}
            />
          </FormField>
        </Stack>
      </FormDialog>
    </Section>
  );
}

