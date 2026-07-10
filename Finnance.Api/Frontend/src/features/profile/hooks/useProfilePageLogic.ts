import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/features/auth';
import {
  useUpdateMarketingPreferences,
  useUpdatePassword,
  useUpdateProfile,
} from './useProfile';
import {
  passwordSchema,
  marketingPreferencesSchema,
  type MarketingPreferencesFormValues,
  personalInfoSchema,
  type PasswordFormValues,
  type PersonalInfoFormValues,
} from '../constants';

export function useProfilePageLogic() {
  const { user, refresh, logout } = useAuth();
  const updateProfile = useUpdateProfile();
  const updatePassword = useUpdatePassword();
  const updateMarketingPreferences = useUpdateMarketingPreferences();

  const personalForm = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: { fullName: '' },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', password: '', confirmPassword: '' },
  });

  const marketingForm = useForm<MarketingPreferencesFormValues>({
    resolver: zodResolver(marketingPreferencesSchema),
    defaultValues: { phone: '', marketingConsent: false },
  });

  const { reset: resetPersonal } = personalForm;
  const { reset: resetMarketing } = marketingForm;

  useEffect(() => {
    if (user) {
      resetPersonal({ fullName: user.fullName });
      resetMarketing({
        phone: user.phone ?? '',
        marketingConsent: user.marketingConsent,
      });
    }
  }, [user, resetPersonal, resetMarketing]);

  const submitPersonal = personalForm.handleSubmit((values) => {
    if (!user) return;
    updateProfile.mutate(
      { fullName: values.fullName.trim() },
      { onSuccess: () => refresh() },
    );
  });

  const submitPassword = passwordForm.handleSubmit((values) => {
    if (!user) return;
    updatePassword.mutate(
      { currentPassword: values.currentPassword, password: values.password },
      {
        onSuccess: () => {
          passwordForm.reset({ currentPassword: '', password: '', confirmPassword: '' });
          void logout();
        },
      },
    );
  });

  const submitMarketing = marketingForm.handleSubmit((values) => {
    if (!user) return;
    updateMarketingPreferences.mutate(
      {
        phone: values.phone.trim(),
        marketingConsent: values.marketingConsent,
      },
      { onSuccess: () => refresh() },
    );
  });

  return {
    email: user?.email ?? '',
    isReady: !!user,
    personalForm,
    passwordForm,
    marketingForm,
    submitPersonal,
    submitPassword,
    submitMarketing,
    savingPersonal: updateProfile.isPending,
    savingPassword: updatePassword.isPending,
    savingMarketing: updateMarketingPreferences.isPending,
  };
}
