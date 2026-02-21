import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/auth';
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

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.header}>
        <button
          type="button"
          onClick={onBackToLogin}
          className={styles.backButton}
        >
          <ArrowLeft size={16} />
          Back to sign in
        </button>
        
        <h1 className={styles.title}>Reset your password</h1>
        <p className={styles.subtitle}>
          Enter your email address and we'll send you a link to reset your password
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <Input
          label="Email address"
          type="email"
          placeholder="Enter your email"
          leftIcon={<Mail size={16} />}
          fullWidth
          error={errors.email?.message}
          {...register('email')}
        />

        {error && (
          <motion.div
            className={styles.errorMessage}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isLoading}
        >
          Send reset link
        </Button>
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