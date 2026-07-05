import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import styles from './HumanCheck.module.scss';

interface HumanCheckProps {
  verified: boolean;
  onVerified: () => void;
}

/**
 * Lightweight, self-contained "I'm not a robot" gate shown after repeated
 * failed sign-in attempts. It runs entirely client-side so it works against the
 * mock backend; swap the verify step for Google reCAPTCHA (a token from a
 * `VITE_RECAPTCHA_SITE_KEY` widget) when a real backend is wired in.
 */
export const HumanCheck: React.FC<HumanCheckProps> = ({ verified, onVerified }) => {
  const [checking, setChecking] = useState(false);

  const handleClick = () => {
    if (verified || checking) return;
    setChecking(true);
    // Simulate the async token round-trip a real challenge performs.
    window.setTimeout(() => {
      setChecking(false);
      onVerified();
    }, 900);
  };

  return (
    <motion.div
      className={styles.wrap}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.25 }}
    >
      <button
        type="button"
        className={styles.box}
        role="checkbox"
        aria-checked={verified}
        aria-label="Verify you are human"
        disabled={verified || checking}
        onClick={handleClick}
        data-state={verified ? 'verified' : checking ? 'checking' : 'idle'}
      >
        <span className={styles.check}>
          {checking ? (
            <span className={styles.spinner} aria-hidden="true" />
          ) : verified ? (
            <Check size={16} strokeWidth={3} aria-hidden="true" />
          ) : null}
        </span>
        <span className={styles.label}>
          {verified ? 'Verified' : checking ? 'Verifying…' : "I'm not a robot"}
        </span>
      </button>
      <span className={styles.brand} aria-hidden="true">
        Security check
      </span>
    </motion.div>
  );
};
