import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { AuthPageLayout } from '@/components/auth/AuthPageLayout';
import { DEFAULT_TENANT_ID } from '@/mocks/tenants';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [emailSent, setEmailSent] = useState(false);

  const handleBackToLogin = () => navigate('/login');
  const handleSuccess = () => setEmailSent(true);

  if (emailSent) {
    return (
      <AuthPageLayout
        title="Check your email"
        subtitle="We've sent a password reset link. Please check your inbox."
      >
        <button
          type="button"
          onClick={handleBackToLogin}
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
      </AuthPageLayout>
    );
  }

  return (
    <AuthPageLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send you a link to reset your password."
    >
      <ForgotPasswordForm
        tenantId={DEFAULT_TENANT_ID}
        onBackToLogin={handleBackToLogin}
        onSuccess={handleSuccess}
      />
    </AuthPageLayout>
  );
};
