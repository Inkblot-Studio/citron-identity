import React, { useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuthStore } from '@/store/auth';

export const LoginPage: React.FC = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/dashboard';
  const { user, pendingMFA } = useAuthStore();

  useEffect(() => {
    if (user?.isAuthenticated && !pendingMFA && tenantId) {
      navigate(returnUrl, { replace: true });
    }
  }, [user, pendingMFA, tenantId, navigate, returnUrl]);

  useEffect(() => {
    if (pendingMFA && user && tenantId) {
      navigate(`/auth/${tenantId}/mfa/verify`, { replace: true });
    }
  }, [pendingMFA, user, tenantId, navigate]);

  const handleSwitchToSignup = () => {
    if (tenantId) navigate(`/auth/${tenantId}/signup`);
  };

  const handleForgotPassword = () => {
    if (tenantId) navigate(`/auth/${tenantId}/forgot-password`);
  };

  if (!tenantId) return null;

  return (
    <LoginForm
      tenantId={tenantId}
      onSwitchToSignup={handleSwitchToSignup}
      onForgotPassword={handleForgotPassword}
    />
  );
};
