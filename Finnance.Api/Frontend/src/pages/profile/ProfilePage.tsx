import { Spinner } from '@/shared/components/ui';
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
      <div>
        <h1 className="text-2xl font-bold text-text">Meu perfil</h1>
        <p className="text-sm text-text-muted">
          Atualize seus dados pessoais e a sua senha de acesso.
        </p>
      </div>

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
