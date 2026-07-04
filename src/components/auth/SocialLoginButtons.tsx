import React from 'react';
import { SOCIAL_PROVIDERS, type SocialProviderId } from './social-icons';
import styles from './SocialLoginButtons.module.scss';

interface SocialLoginButtonsProps {
  onGoogleSignIn: () => Promise<void>;
  onAppleSignIn?: () => Promise<void>;
  onMicrosoftSignIn?: () => Promise<void>;
}

export const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  onGoogleSignIn,
  onAppleSignIn,
  onMicrosoftSignIn,
}) => {
  const handleGoogleSignIn = async () => {
    try {
      await onGoogleSignIn();
    } catch (error) {
      console.error('Google sign-in failed:', error);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      await onAppleSignIn?.();
    } catch (error) {
      console.error('Apple sign-in failed:', error);
    }
  };

  const handleMicrosoftSignIn = async () => {
    try {
      await onMicrosoftSignIn?.();
    } catch (error) {
      console.error('Microsoft sign-in failed:', error);
    }
  };

  const clickHandlers: Record<SocialProviderId, () => Promise<void>> = {
    google: handleGoogleSignIn,
    apple: handleAppleSignIn,
    microsoft: handleMicrosoftSignIn,
  };
  const shown: Record<SocialProviderId, boolean> = {
    google: true,
    apple: !!onAppleSignIn,
    microsoft: !!onMicrosoftSignIn,
  };

  const visibleButtons = SOCIAL_PROVIDERS.filter((p) => shown[p.id]).map((p) => ({
    ...p,
    onClick: clickHandlers[p.id],
  }));

  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>Or sign in with</span>
      <div className={styles.container}>
        {visibleButtons.map(({ id, label, onClick, icon }) => (
        <button
          key={id}
          type="button"
          className={styles.socialButton}
          onClick={onClick}
        >
          <span className={styles.socialLogo}>{icon}</span>
          <span className={styles.socialLabel}>{label}</span>
        </button>
      ))}
      </div>
    </div>
  );
}; 