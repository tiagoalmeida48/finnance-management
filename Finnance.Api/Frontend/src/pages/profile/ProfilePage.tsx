import { UserRound } from 'lucide-react';
import { PageHeader, Spinner } from '@/shared/components/ui';
import {
  PersonalInfoForm,
  SecurityForm,
  useProfilePageLogic,
} from '@/features/profile';

export function ProfilePage() {
  const {
    email,
    isReady,
    personalForm,
    passwordForm,
    submitPersonal,
    submitPassword,
    savingPersonal,
    savingPassword,
  } = useProfilePageLogic();

  if (!isReady) {
    return (
      <div className="py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={UserRound}
        eyebrow="Sua conta"
        title="Meu perfil"
        description="Atualize seus dados pessoais e a sua senha de acesso."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PersonalInfoForm
          form={personalForm}
          email={email}
          saving={savingPersonal}
          onSubmit={submitPersonal}
        />
        <SecurityForm
          form={passwordForm}
          saving={savingPassword}
          onSubmit={submitPassword}
        />
      </div>
    </div>
  );
}
