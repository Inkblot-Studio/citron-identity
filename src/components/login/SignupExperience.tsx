import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { z } from 'zod';
import { Eye, EyeOff, Lock, Mail, MailCheck, Sparkles, User } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { authApi } from '@/lib/auth-api';
import { generateUsername, generateUsernameWithAI, getPasswordStrength } from '@/lib/utils';
import { DEFAULT_TENANT_ID } from '@/mocks/tenants';
import { AuthExperienceShell } from './AuthExperienceShell';
import { FloatingInput } from './FloatingInput';
import { ShimmerButton } from './ShimmerButton';
import { SocialButtons } from './SocialButtons';
import { cardEase } from './authSceneUtils';
import type { MascotMood } from './CitronMascot';
import styles from './AuthExperience.module.scss';

const signupSchema = z
  .object({
    email: z.string().email('Please enter a valid email address'),
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

const strengthColor = (score: number) => {
  if (score <= 2) return 'var(--color-error, #d1483b)';
  if (score <= 3) return 'var(--color-warning, var(--inkblot-color-semantic-warning-main))';
  return 'var(--color-success, #2d8a4e)';
};

const strengthLabel = (score: number) => {
  if (score <= 2) return 'Weak';
  if (score <= 3) return 'Fair';
  if (score <= 4) return 'Good';
  return 'Strong';
};

export const SignupExperience: React.FC = () => {
  const navigate = useNavigate();
  const { user, pendingEmailVerification, signup, isLoading, error } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [attentive, setAttentive] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [usernameTaken, setUsernameTaken] = useState<string | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isGeneratingUsername, setIsGeneratingUsername] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [] as string[],
  });

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

  const email = watch('email') ?? '';
  const username = watch('username') ?? '';
  const password = watch('password') ?? '';

  useEffect(() => {
    if (user?.isAuthenticated && !pendingEmailVerification) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, pendingEmailVerification, navigate]);

  // Backend accounts that don't require email verification are active immediately —
  // there's nothing to wait for, so send the user to sign in once the animation plays.
  useEffect(() => {
    if (celebrating && user && !user.isAuthenticated && !pendingEmailVerification) {
      const timer = setTimeout(() => navigate('/login', { replace: true }), 1500);
      return () => clearTimeout(timer);
    }
  }, [celebrating, user, pendingEmailVerification, navigate]);

  useEffect(() => {
    if (email && !username) {
      setValue('username', generateUsername(email));
    }
  }, [email, username, setValue]);

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
      if (!available) setUsernameTaken(value);
    } finally {
      setIsCheckingUsername(false);
    }
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
        tenantId: DEFAULT_TENANT_ID,
      });
      setCelebrating(true);
    } catch {
      // Error handled by the store
    }
  };

  const hasError =
    !!error || !!usernameTaken || Object.keys(errors).length > 0;

  const mood: MascotMood = celebrating
    ? 'celebrating'
    : hasError
      ? 'confused'
      : passwordFocused && !showPassword && password.length > 0
        ? 'shy'
        : 'idle';

  const formError =
    usernameTaken
      ? 'This username is already taken'
      : errors.email?.message ||
        errors.username?.message ||
        errors.password?.message ||
        errors.confirmPassword?.message ||
        error ||
        '';

  if (user && pendingEmailVerification) {
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
            We sent a verification link to <strong>{user.email}</strong>. Open it to
            activate your account.
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
          Already have an account?{' '}
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
          <h1 className={styles.cardTitle}>Create your account</h1>
        </header>

        <div className={styles.fields}>
          <FloatingInput
            label="Email"
            type="email"
            autoComplete="email"
            leading={<Mail size={18} strokeWidth={1.9} />}
            error={Boolean(errors.email)}
            {...register('email')}
          />

          <FloatingInput
            label="Username"
            type="text"
            autoComplete="username"
            leading={<User size={18} strokeWidth={1.9} />}
            error={Boolean(errors.username || usernameTaken)}
            {...register('username', {
              onBlur: (e) => checkUsernameAvailability(e.target.value),
            })}
            trailing={
              <button
                type="button"
                className={styles.peekButton}
                disabled={!email || isGeneratingUsername}
                onClick={handleGenerateUsername}
                aria-label="Generate username with AI"
                title="Generate username"
              >
                <Sparkles
                  size={17}
                  className={isGeneratingUsername ? styles.iconSpin : undefined}
                />
              </button>
            }
          />

          <FloatingInput
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            leading={<Lock size={18} strokeWidth={1.9} />}
            error={Boolean(errors.password)}
            {...register('password', {
              onBlur: () => setPasswordFocused(false),
            })}
            onFocus={() => setPasswordFocused(true)}
            trailing={
              <button
                type="button"
                className={styles.peekButton}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            }
          />

          {password && (
            <motion.div
              className={styles.passwordStrength}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <div className={styles.strengthBar}>
                <div
                  className={styles.strengthFill}
                  style={{
                    width: `${(passwordStrength.score / 5) * 100}%`,
                    backgroundColor: strengthColor(passwordStrength.score),
                  }}
                />
              </div>
              <span
                className={styles.strengthText}
                style={{ color: strengthColor(passwordStrength.score) }}
              >
                {strengthLabel(passwordStrength.score)}
              </span>
            </motion.div>
          )}

          <FloatingInput
            label="Confirm password"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            leading={<Lock size={18} strokeWidth={1.9} />}
            error={Boolean(errors.confirmPassword)}
            {...register('confirmPassword')}
            trailing={
              <button
                type="button"
                className={styles.peekButton}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            }
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
          loading={isLoading || isCheckingUsername}
          disabled={!!usernameTaken}
          onHoverStart={() => setAttentive(true)}
          onHoverEnd={() => setAttentive(false)}
        >
          Create account
        </ShimmerButton>

        <div className={styles.divider} role="separator">
          <span>or</span>
        </div>

        <SocialButtons
          onGoogleSignIn={async () => console.log('Google sign-in')}
          onAppleSignIn={async () => console.log('Apple sign-in')}
          onMicrosoftSignIn={async () => console.log('Microsoft sign-in')}
        />
      </motion.form>
    </AuthExperienceShell>
  );
};
