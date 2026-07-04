import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { SOCIAL_PROVIDERS, type SocialProviderId } from '../auth/social-icons';
import styles from './SocialButtons.module.scss';

interface SocialButtonsProps {
  onGoogleSignIn: () => Promise<void>;
  onAppleSignIn?: () => Promise<void>;
  onMicrosoftSignIn?: () => Promise<void>;
}

/** Minimal icon-only social sign-in row: soft white tiles for the light scene. */
export const SocialButtons: React.FC<SocialButtonsProps> = ({
  onGoogleSignIn,
  onAppleSignIn,
  onMicrosoftSignIn,
}) => {
  const reducedMotion = useReducedMotion();

  const handlers: Record<SocialProviderId, (() => Promise<void>) | undefined> = {
    google: onGoogleSignIn,
    apple: onAppleSignIn,
    microsoft: onMicrosoftSignIn,
  };

  const visible = SOCIAL_PROVIDERS.filter((p) => handlers[p.id]);

  return (
    <div className={styles.row}>
      {visible.map(({ id, label, icon }) => (
        <motion.button
          key={id}
          type="button"
          className={styles.socialButton}
          whileHover={reducedMotion ? undefined : { y: -3 }}
          whileTap={reducedMotion ? undefined : { scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 500, damping: 24 }}
          onClick={() => {
            handlers[id]?.().catch((error) => {
              console.error(`${label} sign-in failed:`, error);
            });
          }}
          aria-label={`Continue with ${label}`}
          title={`Continue with ${label}`}
        >
          <span className={styles.icon}>{icon}</span>
        </motion.button>
      ))}
    </div>
  );
};
