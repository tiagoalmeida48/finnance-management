import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/features/auth';
import { useUpdatePassword, useUpdateProfile } from './useProfile';
import {
  passwordSchema,
  personalInfoSchema,
  type PasswordFormValues,
  type PersonalInfoFormValues,
} from '../constants';

export function useProfilePageLogic() {
  const { user, refresh } = useAuth();
  const updateProfile = useUpdateProfile();
  const updatePassword = useUpdatePassword();

  const personalForm = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: { fullName: '' },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const { reset: resetPersonal } = personalForm;

  useEffect(() => {
    if (user) {
      resetPersonal({ fullName: user.fullName });
    }
  }, [user, resetPersonal]);

  const submitPersonal = personalForm.handleSubmit((values) => {
    if (!user) return;
    updateProfile.mutate(
      {
        user: user.user,
        email: user.email,
        fullName: values.fullName.trim(),
        isAdmin: user.isAdmin,
      },
      { onSuccess: () => refresh() },
    );
  });

  const submitPassword = passwordForm.handleSubmit((values) => {
    if (!user) return;
    updatePassword.mutate(
      { user: user.user, password: values.password },
      { onSuccess: () => passwordForm.reset({ password: '', confirmPassword: '' }) },
    );
  });

  return {
    email: user?.email ?? '',
    isReady: !!user,
    personalForm,
    passwordForm,
    submitPersonal,
    submitPassword,
    savingPersonal: updateProfile.isPending,
    savingPassword: updatePassword.isPending,
  };
}
