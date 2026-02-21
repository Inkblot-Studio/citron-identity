import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/auth';
import { SocialLoginButtons } from './SocialLoginButtons';
import styles from './LoginForm.module.scss';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  tenantId: string;
  onSwitchToSignup: () => void;
  onForgotPassword: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  tenantId,
  onSwitchToSignup,
  onForgotPassword,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordless, setIsPasswordless] = useState(false);
  const { login, sendMagicLink, isLoading, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const email = watch('email');

  const onSubmit = async (data: LoginFormData) => {
    try {
      if (isPasswordless) {
        await sendMagicLink(data.email, tenantId);
      } else {
        await login(data.email, data.password, tenantId);
      }
    } catch {
      // Error is handled by the store
    }
  };

  const handlePasswordlessToggle = () => {
    setIsPasswordless(!isPasswordless);
    clearError();
  };

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.header}>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>
          Sign in to your InkID account to continue
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

        <AnimatePresence>
          {!isPasswordless && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                leftIcon={<Lock size={16} />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={styles.passwordToggle}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                fullWidth
                error={errors.password?.message}
                {...register('password')}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div
              className={styles.errorMessage}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className={styles.options}>
          <button
            type="button"
            onClick={handlePasswordlessToggle}
            className={styles.passwordlessToggle}
          >
            {isPasswordless ? 'Use password' : 'Use magic link'}
          </button>

          {!isPasswordless && (
            <button
              type="button"
              onClick={onForgotPassword}
              className={styles.forgotPassword}
            >
              Forgot password?
            </button>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isLoading}
        >
          {isPasswordless ? 'Send magic link' : 'Sign in'}
        </Button>

        {isPasswordless && email && (
          <motion.p
            className={styles.magicLinkNote}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            We'll send a secure link to {email}
          </motion.p>
        )}
      </form>

      <div className={styles.divider}>
        <span>or continue with</span>
      </div>

      <SocialLoginButtons onGoogleSignIn={async () => {
        // Mock Google sign-in - in production would use OAuth
        console.log('Google sign-in for tenant:', tenantId);
      }} />

      <div className={styles.footer}>
        <p>
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className={styles.switchButton}
          >
            Sign up
          </button>
        </p>
      </div>
    </motion.div>
  );
}; 