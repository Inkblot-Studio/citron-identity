import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { z } from 'zod';
import { Mail, MailCheck } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { DEFAULT_TENANT_ID } from '@/mocks/tenants';
import { AuthExperienceShell } from './AuthExperienceShell';
import { FloatingInput } from './FloatingInput';
import { ShimmerButton } from './ShimmerButton';
import { cardEase } from './authSceneUtils';
import type { MascotMood } from './CitronMascot';
import styles from './AuthExperience.module.scss';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordExperience: React.FC = () => {
  const navigate = useNavigate();
  const { sendPasswordReset, isLoading, error } = useAuthStore();
  const [emailSent, setEmailSent] = useState(false);
  const [attentive, setAttentive] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await sendPasswordReset(data.email, DEFAULT_TENANT_ID);
      setSentEmail(data.email);
      setEmailSent(true);
      setCelebrating(true);
      setTimeout(() => setCelebrating(false), 1400);
    } catch {
      // Error handled by the store
    }
  };

  const hasError = Boolean(errors.email?.message || error);
  const mood: MascotMood = celebrating ? 'celebrating' : hasError ? 'confused' : 'idle';
  const formError = errors.email?.message || error || '';

  if (emailSent) {
    return (
      <AuthExperienceShell mood="celebrating" celebrating footer={null}>
        <motion.div
          className={styles.successState}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: cardEase }}
        >
          <span className={styles.magicIcon}>
            <MailCheck size={24} strokeWidth={1.9} />
          </span>
          <h2 className={styles.cardTitle}>Check your email</h2>
          <p className={styles.cardSubtitle}>
            We sent a reset link to <strong>{sentEmail}</strong>. It expires shortly, so
            open it soon.
          </p>
          <button
            type="button"
            className={styles.linkButton}
            onClick={() => navigate('/login')}
          >
            Back to sign in
          </button>
        </motion.div>
      </AuthExperienceShell>
    );
  }

  return (
    <AuthExperienceShell
      mood={mood}
      celebrating={celebrating}
      attentive={attentive}
      footer={
        <p className={styles.footer}>
          Remember your password?{' '}
          <button
            type="button"
            className={styles.footerLink}
            onClick={() => navigate('/login')}
          >
            Sign in
          </button>
        </p>
      }
    >
      <motion.form
        onSubmit={handleSubmit(onSubmit)}
        className={styles.form}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: cardEase }}
      >
        <header className={styles.cardHeader}>
          <h1 className={styles.cardTitle}>Reset your password</h1>
          <p className={styles.cardSubtitle}>
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </header>

        <div className={styles.fields}>
          <FloatingInput
            label="Email"
            type="email"
            autoComplete="email"
            leading={<Mail size={18} strokeWidth={1.9} />}
            error={Boolean(errors.email || error)}
            {...register('email')}
          />
        </div>

        <div aria-live="polite" className={styles.errorRegion}>
          <AnimatePresence>
            {formError && (
              <motion.p
                className={styles.errorMessage}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                role="alert"
              >
                {formError}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <ShimmerButton
          type="submit"
          loading={isLoading}
          onHoverStart={() => setAttentive(true)}
          onHoverEnd={() => setAttentive(false)}
        >
          Send reset link
        </ShimmerButton>
      </motion.form>
    </AuthExperienceShell>
  );
};
