import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AuthPageLayout } from '@/components/auth/AuthPageLayout';

export const MFAVerifyPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, verifyMFA, isLoading, error } = useAuthStore();
  const [code, setCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !code) return;
    try {
      await verifyMFA(user.id, code);
      navigate('/dashboard', { replace: true });
    } catch {
      // Error in store
    }
  };

  if (!user) return null;

  return (
    <AuthPageLayout
      title="Two-factor authentication"
      subtitle="Enter the 6-digit code from your authenticator app."
    >
      <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
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
          Verify
        </Button>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
          Lost your device? Use a backup code if you have one.
        </p>
      </form>
    </AuthPageLayout>
  );
};
