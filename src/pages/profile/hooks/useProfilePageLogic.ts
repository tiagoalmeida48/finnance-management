import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/supabase/auth-context';
import { supabase } from '@/lib/supabase/client';

type FeedbackMessage = { type: 'success' | 'error'; text: string } | null;

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export function useProfilePageLogic() {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState<FeedbackMessage>(null);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  useEffect(() => {
    if (profile && fetching) {
      setFullName(profile.full_name || '');
      setAvatarUrl(profile.avatar_url || null);
      setFetching(false);
    } else if (user && fetching) {
      refreshProfile().finally(() => setFetching(false));
    } else {
      setFetching(false);
    }
  }, [profile, user, fetching, refreshProfile]);

  async function handleUpdate() {
    if (!user) return;
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: fullName,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      await refreshProfile();
      setMessage({ type: 'success', text: 'Nome atualizado com sucesso!' });
    } catch (error: unknown) {
      setMessage({
        type: 'error',
        text: getErrorMessage(error, 'Erro ao atualizar perfil.'),
      });
    } finally {
      setLoading(false);
    }
  }

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);
      setMessage(null);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você deve selecionar uma imagem para o avatar.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const { error: updateError } = await supabase.from('profiles').upsert({
        id: user?.id,
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      });

      if (updateError) throw updateError;

      await refreshProfile();
      setMessage({ type: 'success', text: 'Foto do perfil atualizada!' });
    } catch (error: unknown) {
      setMessage({
        type: 'error',
        text: getErrorMessage(error, 'Erro ao carregar avatar.'),
      });
    } finally {
      setUploading(false);
    }
  }

  async function handlePasswordUpdate() {
    if (!user) return;
    if (!password) {
      setMessage({ type: 'error', text: 'A senha não pode estar vazia.' });
      return;
    }
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem.' });
      return;
    }

    setPwdLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Senha atualizada com sucesso!' });
      setPassword('');
      setConfirmPassword('');
    } catch (error: unknown) {
      setMessage({
        type: 'error',
        text: getErrorMessage(error, 'Erro ao atualizar senha.'),
      });
    } finally {
      setPwdLoading(false);
    }
  }

  return {
    user,
    profile,
    loading,
    fetching,
    message,
    setMessage,
    fullName,
    setFullName,
    avatarUrl,
    uploading,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    pwdLoading,
    handleUpdate,
    uploadAvatar,
    handlePasswordUpdate,
  };
}
