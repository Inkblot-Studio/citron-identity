import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignupForm } from '@/components/auth/SignupForm';
import { AuthPageLayout } from '@/components/auth/AuthPageLayout';
import { useAuthStore } from '@/store/auth';
import { DEFAULT_TENANT_ID } from '@/mocks/tenants';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, pendingEmailVerification } = useAuthStore();

  useEffect(() => {
    if (user?.isAuthenticated && !pendingEmailVerification) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, pendingEmailVerification, navigate]);

  const handleSwitchToLogin = () => navigate('/login');

  if (user && pendingEmailVerification) {
    return (
      <AuthPageLayout
        title="Check your email"
        subtitle={`We've sent a verification link to ${user.email}. Please check your inbox.`}
      >
        <div className="auth-form-content">
          <button
            type="button"
            onClick={handleSwitchToLogin}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              padding: 0,
              marginTop: 'var(--space-4)',
            }}
          >
            Back to sign in
          </button>
        </div>
      </AuthPageLayout>
    );
  }

  return (
    <AuthPageLayout
      title="Create your account"
      subtitle="One Citron account for all your apps."
    >
      <SignupForm tenantId={DEFAULT_TENANT_ID} onSwitchToLogin={handleSwitchToLogin} />
    </AuthPageLayout>
  );
};
