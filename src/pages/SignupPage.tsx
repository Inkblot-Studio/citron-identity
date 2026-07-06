import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignupWizard } from '@/components/auth/SignupWizard';
import { useAuthStore } from '@/store/auth';
import { DEFAULT_TENANT_ID } from '@/mocks/tenants';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, pendingEmailVerification, resetSignupFlow } = useAuthStore();

  useEffect(() => {
    resetSignupFlow();
  }, [resetSignupFlow]);

  useEffect(() => {
    if (user?.isAuthenticated && !pendingEmailVerification) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, pendingEmailVerification, navigate]);

  return <SignupWizard tenantId={DEFAULT_TENANT_ID} />;
};
