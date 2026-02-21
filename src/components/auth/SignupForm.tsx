import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { authApi } from '@/lib/auth-api';
import { generateUsername, generateUsernameWithAI, getPasswordStrength } from '@/lib/utils';
import { SocialLoginButtons } from './SocialLoginButtons';
import authFormStyles from './AuthForm.module.scss';
import styles from './SignupForm.module.scss';

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
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
  const [isFocused, setIsFocused] = useState(false);
  const [usernameTaken, setUsernameTaken] = useState<string | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isGeneratingUsername, setIsGeneratingUsername] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] as string[] });
  const { signup, isLoading, error } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    clearErrors,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const email = watch('email');
  const username = watch('username');
  const password = watch('password') ?? '';

  useEffect(() => {
    if (email && !username) {
      const generated = generateUsername(email);
      setValue('username', generated);
    }
  }, [email, setValue, watch, username]);

  useEffect(() => {
    setPasswordStrength(password ? getPasswordStrength(password) : { score: 0, feedback: [] });
  }, [password]);

  const checkUsernameAvailability = async (value: string) => {
    if (!value || value.length < 3) {
      setUsernameTaken(null);
      return;
    }
    setIsCheckingUsername(true);
    setUsernameTaken(null);
    try {
      const available = await authApi.checkUsernameAvailability(value);
      if (!available) {
        setUsernameTaken(value);
      }
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleUsernameBlur = () => {
    const value = watch('username');
    if (value) checkUsernameAvailability(value);
  };

  const handleGenerateUsername = async () => {
    if (!email) return;
    setIsGeneratingUsername(true);
    try {
      const generated = await generateUsernameWithAI(email);
      setValue('username', generated);
      clearErrors('username');
      await checkUsernameAvailability(generated);
    } finally {
      setIsGeneratingUsername(false);
    }
  };

  const onSubmit = async (data: SignupFormData) => {
    if (usernameTaken) return;
    try {
      await signup({
        email: data.email,
        password: data.password,
        username: data.username,
        tenantId,
      });
    } catch {
      // Error is handled by the store
    }
  };

  const getPasswordStrengthColor = (score: number) => {
    if (score <= 2) return 'var(--color-error)';
    if (score <= 3) return 'var(--color-warning)';
    return 'var(--color-success)';
  };

  const getPasswordStrengthText = (score: number) => {
    if (score <= 2) return 'Weak';
    if (score <= 3) return 'Fair';
    if (score <= 4) return 'Good';
    return 'Strong';
  };

  const hasError = !!error || !!usernameTaken || Object.keys(errors).length > 0;

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
          <div className={authFormStyles.inputRow}>
            <input
              type="text"
              className={authFormStyles.input}
              placeholder="username"
              {...register('username')}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                setIsFocused(false);
                handleUsernameBlur();
              }}
            />
            <button
              type="button"
              className={`${authFormStyles.passwordPeek} ${isGeneratingUsername ? styles.aiLoading : ''}`}
              onClick={handleGenerateUsername}
              disabled={!email || isGeneratingUsername}
              aria-label="Generate username with AI"
              title="Generate username"
            >
              <Sparkles size={16} className={isGeneratingUsername ? styles.aiSpinner : ''} />
            </button>
          </div>
          <div className={authFormStyles.inputRow}>
            <input
              type={showPassword ? 'text' : 'password'}
              className={authFormStyles.input}
              placeholder="password"
              {...register('password')}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            <button
              type="button"
              className={authFormStyles.passwordPeek}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className={authFormStyles.inputRow}>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              className={authFormStyles.input}
              placeholder="confirm password"
              {...register('confirmPassword')}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            <button
              type="button"
              className={authFormStyles.passwordPeek}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className={authFormStyles.submitRow}>
            <button
              type="submit"
              className={authFormStyles.submitButton}
              disabled={isLoading || !!usernameTaken || isCheckingUsername}
            >
              {isLoading ? (
                <span className={authFormStyles.spinner} />
              ) : (
                'Create account'
              )}
            </button>
          </div>
        </div>

        {usernameTaken && (
          <motion.div
            className={styles.errorMessage}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            This username is already taken
          </motion.div>
        )}

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
            <span
              className={styles.strengthText}
              style={{ color: getPasswordStrengthColor(passwordStrength.score) }}
            >
              {getPasswordStrengthText(passwordStrength.score)}
            </span>
          </motion.div>
        )}

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
      </form>

      <div className={styles.divider}>
        <span>or continue with</span>
      </div>

      <SocialLoginButtons
        onGoogleSignIn={async () => console.log('Google sign-in for tenant:', tenantId)}
        onAppleSignIn={async () => console.log('Apple sign-in for tenant:', tenantId)}
        onMicrosoftSignIn={async () => console.log('Microsoft sign-in for tenant:', tenantId)}
      />

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
