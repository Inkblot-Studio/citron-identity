import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, Lock, Mail, MailCheck, ShieldCheck, User } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { ACCESS_TOKEN_STORAGE_KEY } from '@/lib/auth-api';
import { DEFAULT_TENANT_ID } from '@/mocks/tenants';
import { generateUsername, isValidEmail } from '@/lib/utils';
import type { AuthProviderId } from '@/types/auth';
import {
  getRedirectUriFromSearch,
  setPendingRedirectUri,
  getPendingRedirectUri,
  clearPendingRedirectUri,
  buildRedirectUrl,
  shouldForceLogin,
} from '@/lib/redirect';
import { AuthExperienceShell } from './AuthExperienceShell';
import { AuthCardHeader } from './AuthCardHeader';
import { FloatingInput } from './FloatingInput';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { ShimmerButton } from './ShimmerButton';
import { SocialButtons } from './SocialButtons';
import { HumanCheck } from './HumanCheck';
import { SOCIAL_PROVIDERS } from '../auth/social-icons';
import { cardEase } from './authSceneUtils';
import type { MascotMood } from './CitronMascot';
import styles from './AuthExperience.module.scss';

type Step =
  | 'email'
  | 'password'
  | 'sso'
  | 'signup'
  | 'mfa'
  | 'magicSent'
  | 'verifyEmail'
  | 'forgot'
  | 'forgotSent';

interface AuthFlowProps {
  /** Deep-link entry point: `forgot` starts on the password-reset step. */
  start?: 'email' | 'forgot';
}

/** After this many failed password attempts, require a human-verification gate. */
const MAX_ATTEMPTS_BEFORE_CHALLENGE = 3;

const providerMeta = (id: AuthProviderId) => SOCIAL_PROVIDERS.find((p) => p.id === id);

export const LoginExperience: React.FC<AuthFlowProps> = ({ start = 'email' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    pendingMFA,
    checkAccount,
    login,
    signup,
    verifyMFA,
    sendMagicLink,
    sendPasswordReset,
    logout,
    isLoading,
    error,
    clearError,
  } = useAuthStore();

  const [step, setStep] = useState<Step>(start === 'forgot' ? 'forgot' : 'email');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [accountName, setAccountName] = useState<string | undefined>();
  const [provider, setProvider] = useState<AuthProviderId | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [attempts, setAttempts] = useState(0);
  const [humanVerified, setHumanVerified] = useState(false);

  const [localError, setLocalError] = useState('');
  const [celebrating, setCelebrating] = useState(false);
  const [attentive, setAttentive] = useState(false);
  const justAuthed = useRef(false);

  const requiresHuman = attempts >= MAX_ATTEMPTS_BEFORE_CHALLENGE;

  // Capture / honor cross-app redirect params.
  useEffect(() => {
    const redirectUri = getRedirectUriFromSearch(location.search);
    if (redirectUri) setPendingRedirectUri(redirectUri);
    if (shouldForceLogin(location.search)) logout();
  }, [location.search, logout]);

  // Route to MFA once the store flags it.
  useEffect(() => {
    if (pendingMFA && user) setStep('mfa');
  }, [pendingMFA, user]);

  // Redirect on successful authentication.
  useEffect(() => {
    if (!user?.isAuthenticated || pendingMFA) return;
    if (shouldForceLogin(location.search) && !justAuthed.current) return;

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

    if (justAuthed.current) {
      setCelebrating(true);
      const t = setTimeout(go, 1100);
      return () => clearTimeout(t);
    }
    go();
  }, [user, pendingMFA, navigate, location.search]);

  const resetTransient = () => {
    setLocalError('');
    clearError();
  };

  const resetSecurity = () => {
    setAttempts(0);
    setHumanVerified(false);
  };

  const goToEmail = () => {
    resetTransient();
    resetSecurity();
    setPassword('');
    setShowPassword(false);
    setProvider(null);
    setStep('email');
  };

  // ---- Step handlers -------------------------------------------------------

  const handleEmailContinue = async () => {
    const value = email.trim();
    if (!isValidEmail(value)) {
      setLocalError('Please enter a valid email address');
      return;
    }
    resetTransient();
    try {
      const result = await checkAccount(value);
      setAccountName(result.name);
      if (!result.exists) {
        setStep('signup');
      } else if (result.provider) {
        setProvider(result.provider);
        setStep('sso');
      } else {
        setStep('password');
      }
    } catch {
      // store sets error
    }
  };

  const handlePasswordSubmit = async () => {
    if (!password.trim()) {
      setLocalError('Please enter your password');
      return;
    }
    if (requiresHuman && !humanVerified) {
      setLocalError('Please complete the security check');
      return;
    }
    resetTransient();
    try {
      justAuthed.current = true;
      await login(email.trim(), password.trim(), DEFAULT_TENANT_ID);
      resetSecurity();
    } catch {
      justAuthed.current = false;
      setAttempts((n) => n + 1);
      setHumanVerified(false);
    }
  };

  const handleSignupSubmit = async () => {
    if (name.trim().length < 2) {
      setLocalError('Please enter your name');
      return;
    }
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters');
      return;
    }
    if (!termsAccepted) {
      setLocalError('Please accept the Terms to continue');
      return;
    }
    resetTransient();
    try {
      justAuthed.current = true;
      await signup({
        email: email.trim(),
        password,
        name: name.trim(),
        username: generateUsername(email.trim()),
        tenantId: DEFAULT_TENANT_ID,
      });
      setCelebrating(true);
      setTimeout(() => setCelebrating(false), 1200);
      setStep('verifyEmail');
    } catch {
      justAuthed.current = false;
    }
  };

  const handleMfaSubmit = async () => {
    if (!/^\d{6}$/.test(otp)) {
      setLocalError('Enter the 6-digit code');
      return;
    }
    if (!user) return;
    resetTransient();
    try {
      justAuthed.current = true;
      await verifyMFA(user.id, otp);
    } catch {
      justAuthed.current = false;
    }
  };

  const handleMagicLink = async () => {
    const value = email.trim();
    if (!isValidEmail(value)) {
      setLocalError('Please enter a valid email address');
      return;
    }
    resetTransient();
    try {
      await sendMagicLink(value, DEFAULT_TENANT_ID);
      setStep('magicSent');
    } catch {
      // store sets error
    }
  };

  const handleForgotSubmit = async () => {
    const value = email.trim();
    if (!isValidEmail(value)) {
      setLocalError('Please enter a valid email address');
      return;
    }
    resetTransient();
    try {
      await sendPasswordReset(value, DEFAULT_TENANT_ID);
      setStep('forgotSent');
    } catch {
      // store sets error
    }
  };

  const handleProviderSignIn = (id: AuthProviderId) => {
    // Real OAuth handshake is wired at the backend; mocked here.
    console.log(`Continue with ${id}`);
  };

  // ---- Derived UI state ----------------------------------------------------

  const formError = localError || error || '';
  const hasError = Boolean(formError);
  const covering =
    (step === 'password' || step === 'signup') && passwordFocused && !showPassword;
  const mood: MascotMood = celebrating ? 'celebrating' : hasError ? 'confused' : 'idle';

  const emailChip = (
    <button type="button" className={styles.identityChip} onClick={goToEmail}>
      <Mail size={14} strokeWidth={2} />
      <span>{email}</span>
      <span className={styles.changeLink}>Change</span>
    </button>
  );

  const errorRegion = (
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
  );

  const stepTransition = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.32, ease: cardEase },
  };

  // ---- Steps ---------------------------------------------------------------

  const renderStep = () => {
    switch (step) {
      case 'email':
        return (
          <motion.form
            key="email"
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              handleEmailContinue();
            }}
            {...stepTransition}
          >
            <AuthCardHeader
              title="Welcome to Citron"
              subtitle="Sign in or create your account."
            />

            <div className={styles.fields}>
              <FloatingInput
                label="Email"
                type="email"
                autoComplete="email"
                autoFocus
                value={email}
                error={hasError}
                leading={<Mail size={18} strokeWidth={1.9} />}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (formError) resetTransient();
                }}
              />
            </div>

            {errorRegion}

            <ShimmerButton
              type="submit"
              loading={isLoading}
              disabled={!email.trim()}
              onHoverStart={() => setAttentive(true)}
              onHoverEnd={() => setAttentive(false)}
            >
              Continue
            </ShimmerButton>

            <div className={styles.divider} role="separator">
              <span>or</span>
            </div>

            <SocialButtons
              onGoogleSignIn={async () => handleProviderSignIn('google')}
              onMicrosoftSignIn={async () => handleProviderSignIn('microsoft')}
              onAppleSignIn={async () => handleProviderSignIn('apple')}
            />
          </motion.form>
        );

      case 'password':
        return (
          <motion.form
            key="password"
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              handlePasswordSubmit();
            }}
            {...stepTransition}
          >
            <AuthCardHeader
              title={accountName ? `Welcome back, ${accountName}` : 'Welcome back'}
            />

            {emailChip}

            <div className={styles.fields}>
              <FloatingInput
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                autoFocus
                value={password}
                error={hasError}
                leading={<Lock size={18} strokeWidth={1.9} />}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (formError) resetTransient();
                }}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                trailing={
                  <button
                    type="button"
                    className={styles.peekButton}
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                }
              />
            </div>

            <AnimatePresence>
              {requiresHuman && (
                <HumanCheck
                  verified={humanVerified}
                  onVerified={() => {
                    setHumanVerified(true);
                    if (localError) setLocalError('');
                  }}
                />
              )}
            </AnimatePresence>

            {errorRegion}

            <ShimmerButton
              type="submit"
              loading={isLoading}
              disabled={!password.trim() || (requiresHuman && !humanVerified)}
              onHoverStart={() => setAttentive(true)}
              onHoverEnd={() => setAttentive(false)}
            >
              Sign in
            </ShimmerButton>

            <div className={styles.options}>
              <button
                type="button"
                className={styles.linkButton}
                onClick={() => {
                  resetTransient();
                  setStep('forgot');
                }}
              >
                Forgot password?
              </button>
              <button type="button" className={styles.linkButton} onClick={handleMagicLink}>
                Email me a link
              </button>
            </div>
          </motion.form>
        );

      case 'sso': {
        const meta = provider ? providerMeta(provider) : undefined;
        return (
          <motion.div key="sso" className={styles.form} {...stepTransition}>
            <AuthCardHeader
              title={accountName ? `Welcome back, ${accountName}` : 'Welcome back'}
              subtitle={
                <>
                  This account signs in with <strong>{meta?.label ?? provider}</strong>.
                </>
              }
            />

            {emailChip}

            <button
              type="button"
              className={styles.ssoButton}
              onClick={() => provider && handleProviderSignIn(provider)}
            >
              <span className={styles.ssoIcon}>{meta?.icon}</span>
              Continue with {meta?.label ?? provider}
            </button>
          </motion.div>
        );
      }

      case 'signup':
        return (
          <motion.form
            key="signup"
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              handleSignupSubmit();
            }}
            {...stepTransition}
          >
            <AuthCardHeader title="Create your account" />

            {emailChip}

            <div className={styles.fields}>
              <FloatingInput
                label="Full name"
                type="text"
                autoComplete="name"
                autoFocus
                value={name}
                error={hasError && name.trim().length < 2}
                leading={<User size={18} strokeWidth={1.9} />}
                onChange={(e) => {
                  setName(e.target.value);
                  if (formError) resetTransient();
                }}
              />

              <div className={styles.passwordFieldWrap}>
                <FloatingInput
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  error={hasError && password.length < 8}
                  leading={<Lock size={18} strokeWidth={1.9} />}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (formError) resetTransient();
                  }}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  trailing={
                    <button
                      type="button"
                      className={styles.peekButton}
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  }
                />
                <PasswordStrengthMeter password={password} fieldFocused={passwordFocused} />
              </div>
            </div>

            <label className={styles.terms}>
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => {
                  setTermsAccepted(e.target.checked);
                  if (formError) resetTransient();
                }}
              />
              <span>
                I agree to the <a href="/legal/terms">Terms</a> and{' '}
                <a href="/legal/privacy">Privacy Policy</a>.
              </span>
            </label>

            {errorRegion}

            <ShimmerButton
              type="submit"
              loading={isLoading}
              disabled={!name.trim() || !password || !termsAccepted}
              onHoverStart={() => setAttentive(true)}
              onHoverEnd={() => setAttentive(false)}
            >
              Create account
            </ShimmerButton>
          </motion.form>
        );

      case 'mfa':
        return (
          <motion.form
            key="mfa"
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              handleMfaSubmit();
            }}
            {...stepTransition}
          >
            <span className={styles.magicIcon}>
              <ShieldCheck size={22} strokeWidth={1.9} />
            </span>
            <AuthCardHeader
              title="Two-factor code"
              subtitle="Enter the 6-digit code from your authenticator app."
            />

            <div className={styles.fields}>
              <FloatingInput
                label="6-digit code"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                value={otp}
                error={hasError}
                className={styles.otpInput}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                  if (formError) resetTransient();
                }}
              />
            </div>

            {errorRegion}

            <ShimmerButton
              type="submit"
              loading={isLoading}
              disabled={otp.length !== 6}
              onHoverStart={() => setAttentive(true)}
              onHoverEnd={() => setAttentive(false)}
            >
              Verify
            </ShimmerButton>
          </motion.form>
        );

      case 'magicSent':
        return (
          <motion.div key="magic" className={styles.magicSent} {...stepTransition}>
            <AuthCardHeader
              lead={
                <span className={styles.magicIcon}>
                  <MailCheck size={22} strokeWidth={1.9} />
                </span>
              }
              title="Check your inbox"
              subtitle={
                <>
                  We sent a sign-in link to <strong>{email}</strong>. It expires shortly, so open
                  it soon.
                </>
              }
            />
            <button type="button" className={styles.linkButton} onClick={goToEmail}>
              <ArrowLeft size={14} strokeWidth={2} /> Use a different email
            </button>
          </motion.div>
        );

      case 'verifyEmail':
        return (
          <motion.div key="verify" className={styles.magicSent} {...stepTransition}>
            <AuthCardHeader
              lead={
                <span className={styles.magicIcon}>
                  <MailCheck size={22} strokeWidth={1.9} />
                </span>
              }
              title="Verify your email"
              subtitle={
                <>
                  We sent a verification link to <strong>{email}</strong>. Confirm it to finish
                  setting up your account.
                </>
              }
            />
            <div className={styles.options}>
              <button
                type="button"
                className={styles.linkButton}
                onClick={() => sendMagicLink(email.trim(), DEFAULT_TENANT_ID)}
              >
                Resend
              </button>
              <button type="button" className={styles.linkButton} onClick={goToEmail}>
                Change email
              </button>
            </div>
          </motion.div>
        );

      case 'forgot':
        return (
          <motion.form
            key="forgot"
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              handleForgotSubmit();
            }}
            {...stepTransition}
          >
            <AuthCardHeader
              title="Reset your password"
              subtitle="Enter your email and we'll send you a reset link."
            />

            <div className={styles.fields}>
              <FloatingInput
                label="Email"
                type="email"
                autoComplete="email"
                autoFocus
                value={email}
                error={hasError}
                leading={<Mail size={18} strokeWidth={1.9} />}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (formError) resetTransient();
                }}
              />
            </div>

            {errorRegion}

            <ShimmerButton
              type="submit"
              loading={isLoading}
              disabled={!email.trim()}
              onHoverStart={() => setAttentive(true)}
              onHoverEnd={() => setAttentive(false)}
            >
              Send reset link
            </ShimmerButton>

            <div className={styles.options}>
              <button type="button" className={styles.linkButton} onClick={goToEmail}>
                <ArrowLeft size={14} strokeWidth={2} /> Back to sign in
              </button>
            </div>
          </motion.form>
        );

      case 'forgotSent':
        return (
          <motion.div key="forgotSent" className={styles.magicSent} {...stepTransition}>
            <AuthCardHeader
              lead={
                <span className={styles.magicIcon}>
                  <MailCheck size={22} strokeWidth={1.9} />
                </span>
              }
              title="Check your email"
              subtitle={
                <>
                  We sent a reset link to <strong>{email}</strong>. It expires shortly, so open it
                  soon.
                </>
              }
            />
            <button type="button" className={styles.linkButton} onClick={goToEmail}>
              <ArrowLeft size={14} strokeWidth={2} /> Back to sign in
            </button>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const footer =
    step === 'email' ? (
      <p className={styles.footer}>
        By continuing you agree to our{' '}
        <a className={styles.footerLink} href="/legal/terms">
          Terms
        </a>
        .
      </p>
    ) : null;

  return (
    <AuthExperienceShell
      mood={mood}
      celebrating={celebrating}
      attentive={attentive}
      covering={covering}
      footer={footer}
    >
      <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
    </AuthExperienceShell>
  );
};
