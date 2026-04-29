import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { messages } from '@/shared/i18n/messages';
import { useLoginPageLogic } from '@/pages/auth/hooks/useLoginPageLogic';
import { FormField } from '@/shared/components/forms/FormField';
<<<<<<< HEAD

export function LoginPage() {
  const loginMessages = messages.auth.login;
=======
import { Stack } from '@/shared/components/layout/Stack';
import { Section } from '@/shared/components/layout/Section';
import { FormDialog } from '@/shared/components/composite/FormDialog';

export function LoginPage() {
  const loginMessages = messages.auth.login;
  const siteTitle = 'Gestão Financeira';
>>>>>>> finnance-management/main
  const { formMethods, isLoading, error, onSubmit } = useLoginPageLogic();
  const {
    register,
    formState: { errors },
  } = formMethods;

  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[var(--color-background-alt)] px-4 py-8">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[var(--color-accentGlow)] opacity-30 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] translate-x-1/2 rounded-full bg-[var(--overlay-secondary-10)] opacity-40 blur-[100px]" />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.03] [background-image:linear-gradient(var(--color-text-primary)_1px,transparent_1px),linear-gradient(90deg,var(--color-text-primary)_1px,transparent_1px)] [background-size:40px_40px]"
      />

<<<<<<< HEAD
      <div className="relative w-full max-w-sm">
        <div className="absolute -inset-px rounded-[22px] bg-gradient-to-b from-[var(--overlay-primary-12)] to-transparent opacity-60" />

        <div className="relative overflow-hidden rounded-[20px] border border-[var(--color-border)] bg-[var(--color-card)] shadow-[0_24px_80px_rgba(0,0,0,0.5),0_1px_0_var(--overlay-white-08)_inset]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent opacity-50" />

          <div className="p-8">
            <div className="mb-8 flex flex-col items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-accentGlow)] to-[var(--overlay-primary-08)] ring-1 ring-[var(--overlay-primary-12)]">
                <img src="/finnance-icon.svg" alt="Logo" className="h-9 w-9 object-contain" />
              </div>
              <div className="text-center">
                <h1 className="font-heading text-[22px] font-bold tracking-[-0.02em] text-[var(--color-text-primary)]">
                  Gestão Financeira
                </h1>
                <p className="mt-0.5 text-[13px] text-[var(--color-text-muted)]">
                  Bem-vindo de volta
                </p>
              </div>
            </div>

            <form onSubmit={onSubmit} className="flex flex-col gap-5">
              {error && (
                <div className="rounded-xl border border-[color:color-mix(in_oklab,var(--color-error)_30%,transparent)] bg-[color:color-mix(in_oklab,var(--color-error)_12%,transparent)] px-4 py-3 text-[13px] text-red-200">
                  {error}
                </div>
              )}

              <FormField
                htmlFor="login-email"
                label={loginMessages.emailLabel}
                errorMessage={errors.email?.message}
              >
                <Input id="login-email" type="email" {...register('email')} />
              </FormField>

              <FormField
                htmlFor="login-password"
                label={loginMessages.passwordLabel}
                errorMessage={errors.password?.message}
              >
                <Input id="login-password" type="password" {...register('password')} />
              </FormField>

              <div className="mt-2">
                <Button fullWidth variant="contained" size="large" type="submit" disabled={isLoading}
                  className="h-12 rounded-xl text-[15px] font-bold shadow-[0_0_24px_var(--overlay-primary-15)]"
                >
                  {isLoading ? loginMessages.loading : loginMessages.submit}
                </Button>
              </div>
            </form>
          </div>
        </div>

        <p className="mt-4 text-center text-[12px] text-[var(--color-text-muted)]">
          © {new Date().getFullYear()} Gestão Financeira
        </p>
      </div>
    </div>
=======
      <FormDialog
        open={true}
        onClose={() => {}}
        title={siteTitle}
        onSubmit={onSubmit}
        maxWidth="xs"
        actions={
          <Button fullWidth variant="contained" size="large" type="submit" disabled={isLoading}>
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
            <Input id="login-email" type="email" {...register('email')} />
          </FormField>

          <FormField
            htmlFor="login-password"
            label={loginMessages.passwordLabel}
            errorMessage={errors.password?.message}
          >
            <Input id="login-password" type="password" {...register('password')} />
          </FormField>
        </Stack>
      </FormDialog>
    </Section>
>>>>>>> finnance-management/main
  );
}
