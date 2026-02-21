import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { AuthPageLayout } from '@/components/auth/AuthPageLayout';

export const VerifyEmailPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { verifyEmail, isLoading, error } = useAuthStore();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    verifyEmail(token)
      .then(() => !cancelled && setVerified(true))
      .catch(() => {});
    return () => { cancelled = true; };
  }, [token, verifyEmail]);

  useEffect(() => {
    if (verified) {
      const t = setTimeout(() => navigate('/login'), 2000);
      return () => clearTimeout(t);
    }
  }, [verified, navigate]);

  if (!token) return null;

  if (verified) {
    return (
      <AuthPageLayout
        title="Email verified!"
        subtitle="Redirecting to sign in..."
      />
    );
  }

  if (error) {
    return (
      <AuthPageLayout
        title="Verification failed"
        subtitle={error}
      >
        <button
          type="button"
          onClick={() => navigate('/login')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-lime)',
            fontWeight: 600,
            cursor: 'pointer',
            padding: 0,
            marginTop: 'var(--space-4)',
          }}
        >
          Back to sign in
        </button>
      </AuthPageLayout>
    );
  }

  return (
    <AuthPageLayout
      title="Verifying your email..."
      subtitle={isLoading ? 'Please wait...' : 'Almost done'}
    />
  );
};
