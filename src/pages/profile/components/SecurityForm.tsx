import { IconButton } from '@/shared/components/ui/icon-button';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { messages } from '@/shared/i18n/messages';
import { Stack } from '@/shared/components/layout/Stack';
import { Heading } from '@/shared/components/ui/Heading';
import { FormField } from '@/shared/components/forms/FormField';
import { Container } from '@/shared/components/layout/Container';

interface SecurityFormProps {
  password: string;
  setPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  pwdLoading: boolean;
  handlePasswordUpdate: () => void;
}

export function SecurityForm({
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  pwdLoading,
  handlePasswordUpdate,
}: SecurityFormProps) {
  const formMessages = messages.profile.securityForm;
  return (
    <Stack className="space-y-2">
      <Container unstyled>
        <Heading level={3} className="mb-0.5 text-base font-extrabold">
          {formMessages.title}
        </Heading>
      </Container>

      <FormField label={formMessages.newPasswordLabel} htmlFor="profile-password">
        <Container unstyled className="relative">
          <Lock
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-65"
          />
          <Input
            id="profile-password"
            className="pl-9 pr-9"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <IconButton
            size="small"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </IconButton>
        </Container>
      </FormField>

      <FormField label={formMessages.confirmPasswordLabel} htmlFor="profile-password-confirm">
        <Container unstyled className="relative">
          <Lock
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-65"
          />
          <Input
            id="profile-password-confirm"
            className="pl-9"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </Container>
      </FormField>

      <Button
        fullWidth
        variant="contained"
        size="large"
        onClick={handlePasswordUpdate}
        disabled={pwdLoading}
        startIcon={<ShieldCheck size={18} />}
        className="mt-0.5 rounded-lg py-2 font-extrabold"
      >
        {pwdLoading ? formMessages.updating : formMessages.update}
      </Button>
    </Stack>
  );
}
