import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authService } from '@/features/auth/services/authService';
import { Spinner } from '@/shared/components/ui';
import { AuthShell } from './AuthShell';

type Status = 'loading' | 'success' | 'error';

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [status, setStatus] = useState<Status>('loading');
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (!token) {
      setStatus('error');
      return;
    }
    authService
      .verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <AuthShell title="Confirmação de e-mail">
      {status === 'loading' ? (
        <Spinner />
      ) : status === 'success' ? (
        <p className="text-sm text-text-muted">
          E-mail confirmado! Agora você já pode{' '}
          <Link to="/login" className="text-primary hover:underline">
            entrar
          </Link>
          .
        </p>
      ) : (
        <p className="text-sm text-text-muted">
          Não foi possível confirmar o e-mail. O link pode ter expirado.
        </p>
      )}
    </AuthShell>
  );
}
