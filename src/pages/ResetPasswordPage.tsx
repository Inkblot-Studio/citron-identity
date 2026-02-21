import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { AuthPageLayout } from '@/components/auth/AuthPageLayout';

export const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const handleSuccess = () => navigate('/login');

  if (!token) return null;

  return (
    <AuthPageLayout
      title="Set new password"
      subtitle="Enter your new password below."
    >
      <ResetPasswordForm token={token} onSuccess={handleSuccess} />
    </AuthPageLayout>
  );
};
