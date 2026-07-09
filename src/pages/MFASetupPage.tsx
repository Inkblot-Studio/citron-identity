import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AuthPageLayout } from '@/components/auth/AuthPageLayout';
import {
  buildRedirectUrl,
  clearPendingRedirectUri,
  getPendingRedirectUri,
  getRedirectUriFromSearch,
  getRememberMe,
  setPendingRedirectUri,
} from '@/lib/redirect';
import { getAccessToken } from '@/lib/token-storage';

export const MFASetupPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setupMFA, confirmMFA, mfaSecret, mfaOtpAuthUri, isLoading, error } = useAuthStore();
  const [code, setCode] = useState('');

  useEffect(() => {
    const redirectUri = getRedirectUriFromSearch(location.search);
    if (redirectUri) setPendingRedirectUri(redirectUri);
  }, [location.search]);

  useEffect(() => {
    if (user?.id) setupMFA(user.id);
  }, [user?.id, setupMFA]);

  const finishSetup = () => {
    const redirectUri = getPendingRedirectUri();
    if (redirectUri) {
      clearPendingRedirectUri();
      window.location.href = buildRedirectUrl(redirectUri, getAccessToken() ?? undefined, {
        rememberMe: getRememberMe(),
      });
      return;
    }
    navigate('/dashboard', { replace: true });
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !code) return;
    try {
      await confirmMFA(user.id, code);
      finishSetup();
    } catch {
      // Error in store
    }
  };

  if (!user) return null;

  const qrValue =
    mfaOtpAuthUri ??
    (mfaSecret ? `otpauth://totp/IS:${user.email}?secret=${mfaSecret}` : '');

  return (
    <AuthPageLayout
      title="Set up two-factor authentication"
      subtitle="Scan the QR code with your authenticator app, then enter the 6-digit code."
    >
      <form onSubmit={handleConfirm} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {qrValue && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            <QRCodeSVG value={qrValue} size={160} level="M" />
            {mfaSecret && (
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                Or enter manually: <code style={{ fontFamily: 'monospace' }}>{mfaSecret}</code>
              </p>
            )}
          </div>
        )}
        <Input
          label="Verification code"
          type="text"
          placeholder="000000"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          fullWidth
          error={error ?? undefined}
        />
        <Button type="submit" variant="primary" size="lg" fullWidth loading={isLoading} disabled={code.length !== 6}>
          Verify and enable
        </Button>
      </form>
    </AuthPageLayout>
  );
};
