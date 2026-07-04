import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, MailCheck } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { ACCESS_TOKEN_STORAGE_KEY } from '@/lib/auth-api';
import { DEFAULT_TENANT_ID } from '@/mocks/tenants';
import {
  getRedirectUriFromSearch,
  setPendingRedirectUri,
  getPendingRedirectUri,
  clearPendingRedirectUri,
  buildRedirectUrl,
  shouldForceLogin,
} from '@/lib/redirect';
import { AuthExperienceShell } from './AuthExperienceShell';
import { FloatingInput } from './FloatingInput';
import { ShimmerButton } from './ShimmerButton';
import { SocialButtons } from './SocialButtons';
import { cardEase } from './authSceneUtils';
import type { MascotMood } from './CitronMascot';
import styles from './AuthExperience.module.scss';

export const LoginExperience: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, pendingMFA, login, logout, sendMagicLink, isLoading, error, clearError } =
    useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isPasswordless, setIsPasswordless] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [attentive, setAttentive] = useState(false);
  const justLoggedIn = useRef(false);

  useEffect(() => {
    const redirectUri = getRedirectUriFromSearch(location.search);
    if (redirectUri) setPendingRedirectUri(redirectUri);
    // The relying app rejected the previous session (expired token etc.) —
    // drop it so the form shows instead of auto-redirecting in a loop.
    if (shouldForceLogin(location.search)) logout();
  }, [location.search, logout]);

  useEffect(() => {
    if (user?.isAuthenticated && !pendingMFA) {
      const go = () => {
        const redirectUri = getPendingRedirectUri();
        if (redirectUri) {
          clearPendingRedirectUri();
          const token = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) ?? undefined;
          window.location.href = buildRedirectUrl(redirectUri, token);
        } else {
          navigate('/dashboard', { replace: true });
        }
      };
      if (justLoggedIn.current) {
        setCelebrating(true);
        const t = setTimeout(go, 1100);
        return () => clearTimeout(t);
      }
      go();
    } else if (pendingMFA && user) {
      navigate('/mfa/verify', { replace: true });
    }
  }, [user, pendingMFA, navigate]);

  const validateEmail = (value: string): string => {
    if (!value) return '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Please enter a valid email address';
    if (value.length > 254) return 'Email address is too long';
    const [localPart, domain] = value.split('@');
    if (localPart.length > 64 || domain.length > 253) return 'Email address format is invalid';
    return '';
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const emailErr = validateEmail(email);
    if (emailErr) {
      setEmailError(emailErr);
      return;
    }

    try {
      if (isPasswordless) {
        await sendMagicLink(email, DEFAULT_TENANT_ID);
        setEmailError('');
        setMagicLinkSent(true);
        setCelebrating(true);
        setTimeout(() => setCelebrating(false), 1400);
      } else {
        if (!password.trim()) {
          setEmailError('Please enter your password');
          return;
        }
        justLoggedIn.current = true;
        await login(email.trim(), password.trim(), DEFAULT_TENANT_ID);
      }
    } catch (err) {
      justLoggedIn.current = false;
      setEmailError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      console.log('Google sign-in initiated');
    } catch (err) {
      console.error('Google sign-in failed', err);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      console.log('Apple sign-in initiated');
    } catch (err) {
      console.error('Apple sign-in failed', err);
    }
  };

  const handleMicrosoftSignIn = async () => {
    try {
      console.log('Microsoft sign-in initiated');
    } catch (err) {
      console.error('Microsoft sign-in failed', err);
    }
  };

  const hasError = Boolean(emailError || error);
  const mood: MascotMood = celebrating
    ? 'celebrating'
    : hasError
      ? 'confused'
      : passwordFocused && !showPassword && password.length > 0
        ? 'shy'
        : 'idle';

  return (
    <AuthExperienceShell
      mood={mood}
      celebrating={celebrating}
      attentive={attentive}
      footer={
        <p className={styles.footer}>
          New here?{' '}
          <button
            type="button"
            className={styles.footerLink}
            onClick={() => navigate('/signup')}
          >
            Create an account
          </button>
        </p>
      }
    >
      <AnimatePresence mode="wait">
        {magicLinkSent ? (
          <motion.div
            key="magic-sent"
            className={styles.magicSent}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: cardEase }}
          >
            <span className={styles.magicIcon}>
              <MailCheck size={24} strokeWidth={1.9} />
            </span>
            <h2 className={styles.cardTitle}>Check your inbox</h2>
            <p className={styles.cardSubtitle}>
              We sent a sign-in link to <strong>{email}</strong>. It expires shortly, so
              open it soon.
            </p>
            <button
              type="button"
              className={styles.linkButton}
              onClick={() => {
                setMagicLinkSent(false);
                clearError();
              }}
            >
              Use a different email
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="login-form"
            onSubmit={handleSubmit}
            className={styles.form}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: cardEase }}
          >
            <header className={styles.cardHeader}>
              <h1 className={styles.cardTitle}>Sign in to Citron</h1>
            </header>

            <div className={styles.fields}>
              <FloatingInput
                label="Email"
                type="email"
                autoComplete="email"
                value={email}
                error={Boolean(emailError)}
                leading={<Mail size={18} strokeWidth={1.9} />}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                  if (error) clearError();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && email.trim()) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />

              <AnimatePresence initial={false}>
                {!isPasswordless && (
                  <motion.div
                    key="password"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.35, ease: cardEase }}
                    className={styles.passwordRow}
                  >
                    <FloatingInput
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      error={Boolean(emailError && !validateEmail(email))}
                      leading={<Lock size={18} strokeWidth={1.9} />}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (emailError) setEmailError('');
                        if (error) clearError();
                      }}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div aria-live="polite" className={styles.errorRegion}>
              <AnimatePresence>
                {emailError && (
                  <motion.p
                    className={styles.errorMessage}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                    role="alert"
                  >
                    {emailError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <ShimmerButton
              type="submit"
              loading={isLoading}
              disabled={
                !email.trim() ||
                !!emailError ||
                (!isPasswordless && !password.trim())
              }
              onHoverStart={() => setAttentive(true)}
              onHoverEnd={() => setAttentive(false)}
            >
              {isPasswordless ? 'Send magic link' : 'Sign in'}
            </ShimmerButton>

            <div className={styles.options}>
              <button
                type="button"
                className={styles.linkButton}
                onClick={() => {
                  setIsPasswordless(!isPasswordless);
                  setEmailError('');
                  clearError();
                }}
              >
                {isPasswordless ? 'Use password' : 'Use magic link'}
              </button>
              {!isPasswordless && (
                <button
                  type="button"
                  className={styles.linkButton}
                  onClick={() => navigate('/forgot-password')}
                >
                  Forgot password?
                </button>
              )}
            </div>

            <div className={styles.divider} role="separator">
              <span>or</span>
            </div>

            <SocialButtons
              onGoogleSignIn={handleGoogleSignIn}
              onAppleSignIn={handleAppleSignIn}
              onMicrosoftSignIn={handleMicrosoftSignIn}
            />
          </motion.form>
        )}
      </AnimatePresence>
    </AuthExperienceShell>
  );
};
