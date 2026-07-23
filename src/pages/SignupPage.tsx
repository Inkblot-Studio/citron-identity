import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SignupWizard } from '@/components/auth/SignupWizard';
import { useAuthStore } from '@/store/auth';
import { DEFAULT_TENANT_ID } from '@/mocks/tenants';
import { resolvePostAuthRedirect } from '@/lib/finish-auth';
import {
  getRedirectUriFromSearch,
  setPendingRedirectUri,
} from '@/lib/redirect';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, pendingEmailVerification, resetSignupFlow } = useAuthStore();

  useEffect(() => {
    resetSignupFlow();
  }, [resetSignupFlow]);

  useEffect(() => {
    const redirectUri = getRedirectUriFromSearch(location.search);
    if (redirectUri) setPendingRedirectUri(redirectUri);
  }, [location.search]);

  useEffect(() => {
    if (user?.isAuthenticated && !pendingEmailVerification) {
      const target = resolvePostAuthRedirect(location.search);
      if (target.type === 'external') {
        window.location.href = target.url;
      } else {
        navigate(target.url, { replace: true });
      }
    }
  }, [user, pendingEmailVerification, navigate, location.search]);

  return <SignupWizard tenantId={DEFAULT_TENANT_ID} />;
};
