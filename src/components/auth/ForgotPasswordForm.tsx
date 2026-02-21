import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { useAuthStore } from '@/store/auth';
import authFormStyles from './AuthForm.module.scss';
import styles from './ForgotPasswordForm.module.scss';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordFormProps {
  tenantId: string;
  onBackToLogin: () => void;
  onSuccess?: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  tenantId,
  onBackToLogin,
  onSuccess,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const { sendPasswordReset, isLoading, error } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await sendPasswordReset(data.email, tenantId);
      onSuccess?.();
    } catch {
      // Error is handled by the store
    }
  };

  const hasError = !!errors.email?.message || !!error;

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div
          className={`${authFormStyles.inputGroup} ${isFocused ? authFormStyles.focused : ''} ${hasError ? authFormStyles.error : ''}`}
        >
          <div className={authFormStyles.inputRow}>
            <input
              type="email"
              className={authFormStyles.input}
              placeholder="account email"
              {...register('email')}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
          </div>
          <div className={authFormStyles.submitRow}>
            <button
              type="submit"
              className={authFormStyles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className={authFormStyles.spinner} />
              ) : (
                'Send reset link'
              )}
            </button>
          </div>
        </div>

        {(errors.email?.message || error) && (
          <motion.div
            className={styles.errorMessage}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {errors.email?.message || error}
          </motion.div>
        )}
      </form>

      <div className={styles.footer}>
        <p>
          Remember your password?{' '}
          <button
            type="button"
            onClick={onBackToLogin}
            className={styles.switchButton}
          >
            Sign in
          </button>
        </p>
      </div>
    </motion.div>
  );
};
