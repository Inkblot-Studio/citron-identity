import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { LoginExperience } from '@/components/login/LoginExperience';
import { TestimonialsStep } from './TestimonialsStep';
import { SubscriptionStep } from './SubscriptionStep';

interface SignupWizardProps {
  tenantId: string;
}

export const SignupWizard: React.FC<SignupWizardProps> = ({ tenantId: _tenantId }) => {
  const navigate = useNavigate();
  const { signupStep } = useAuthStore();

  const goToLogin = () => navigate('/login');

  if (signupStep === 'testimonials') {
    return <TestimonialsStep onSignIn={goToLogin} />;
  }

  if (signupStep === 'subscription') {
    return <SubscriptionStep onSignIn={goToLogin} />;
  }

  return <LoginExperience start="email" />;
};
