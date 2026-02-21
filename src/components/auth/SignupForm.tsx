import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { User, Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/auth';
import { generateUsername, getPasswordStrength } from '@/lib/utils';
import { SocialLoginButtons } from './SocialLoginButtons';
import styles from './SignupForm.module.scss';

const signupSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Please enter a valid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

interface SignupFormProps {
  tenantId: string;
  onSwitchToLogin: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ tenantId, onSwitchToLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] as string[] });
  const { signup, isLoading, error } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const email = watch('email');
  const password = watch('password');

  // Auto-generate username when email changes
  useEffect(() => {
    if (email && !watch('username')) {
      const generatedUsername = generateUsername(email);
      setValue('username', generatedUsername);
    }
  }, [email, setValue, watch]);

  // Check password strength
  useEffect(() => {
    if (password) {
      setPasswordStrength(getPasswordStrength(password));
    }
  }, [password]);

  const onSubmit = async (data: SignupFormData) => {
    try {
      await signup({
        email: data.email,
        password: data.password,
        name: data.name,
        username: data.username,
        tenantId,
      });
    } catch {
      // Error is handled by the store
    }
  };

  const getPasswordStrengthColor = (score: number) => {
    if (score <= 2) return 'var(--color-error-500)';
    if (score <= 3) return 'var(--color-warning-500)';
    return 'var(--color-success-500)';
  };

  const getPasswordStrengthText = (score: number) => {
    if (score <= 2) return 'Weak';
    if (score <= 3) return 'Fair';
    if (score <= 4) return 'Good';
    return 'Strong';
  };

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.header}>
        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.subtitle}>
          Join InkID to access all Inkblot Studio applications
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <Input
          label="Full name"
          type="text"
          placeholder="Enter your full name"
          leftIcon={<User size={16} />}
          fullWidth
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Email address"
          type="email"
          placeholder="Enter your email"
          leftIcon={<Mail size={16} />}
          fullWidth
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Username"
          type="text"
          placeholder="Choose a username"
          leftIcon={<Sparkles size={16} />}
          fullWidth
          error={errors.username?.message}
          helperText="Leave blank to auto-generate"
          {...register('username')}
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Create a strong password"
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

        {password && (
          <motion.div
            className={styles.passwordStrength}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className={styles.strengthBar}>
              <div
                className={styles.strengthFill}
                style={{
                  width: `${(passwordStrength.score / 5) * 100}%`,
                  backgroundColor: getPasswordStrengthColor(passwordStrength.score),
                }}
              />
            </div>
            <div className={styles.strengthInfo}>
              <span
                className={styles.strengthText}
                style={{ color: getPasswordStrengthColor(passwordStrength.score) }}
              >
                {getPasswordStrengthText(passwordStrength.score)}
              </span>
              {passwordStrength.feedback.length > 0 && (
                <ul className={styles.strengthFeedback}>
                  {passwordStrength.feedback.map((feedback, index) => (
                    <li key={index}>{feedback}</li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}

        <Input
          label="Confirm password"
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="Confirm your password"
          leftIcon={<Lock size={16} />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className={styles.passwordToggle}
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          fullWidth
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

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

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isLoading}
        >
          Create account
        </Button>
      </form>

      <div className={styles.divider}>
        <span>or continue with</span>
      </div>

      <SocialLoginButtons onGoogleSignIn={async () => {
        console.log('Google sign-in for tenant:', tenantId);
      }} />

      <div className={styles.footer}>
        <p>
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className={styles.switchButton}
          >
            Sign in
          </button>
        </p>
      </div>
    </motion.div>
  );
}; 