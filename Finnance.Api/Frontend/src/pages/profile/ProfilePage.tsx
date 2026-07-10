import { UserRound } from 'lucide-react';
import { PageHeader, Spinner } from '@/shared/components/ui';
import {
  PersonalInfoForm,
  MarketingPreferencesForm,
  SecurityForm,
  useProfilePageLogic,
} from '@/features/profile';

export function ProfilePage() {
  const {
    email,
    isReady,
    personalForm,
    passwordForm,
    marketingForm,
    submitPersonal,
    submitPassword,
    submitMarketing,
    savingPersonal,
    savingPassword,
    savingMarketing,
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
        description="Atualize seus dados pessoais, preferências de comunicação e senha."
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
        <MarketingPreferencesForm
          form={marketingForm}
          saving={savingMarketing}
          onSubmit={submitMarketing}
        />
      </div>
    </div>
  );
}
