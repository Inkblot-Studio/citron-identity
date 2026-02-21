import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { SocialLoginButtons } from './SocialLoginButtons';
import { useAuthStore } from '@/store/auth';
import { DEFAULT_TENANT_ID } from '@/mocks/tenants';
import {
  getRedirectUriFromSearch,
  setPendingRedirectUri,
  getPendingRedirectUri,
  clearPendingRedirectUri,
  buildRedirectUrl,
} from '@/lib/redirect';
import styles from './AuthPortal.module.scss';
import authFormStyles from './AuthForm.module.scss';

export const AuthPortal: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, pendingMFA, login, sendMagicLink, isLoading, error, clearError } = useAuthStore();

  // Capture redirect_uri from URL on mount (e.g. from Domain A)
  useEffect(() => {
    const redirectUri = getRedirectUriFromSearch(location.search);
    if (redirectUri) setPendingRedirectUri(redirectUri);
  }, [location.search]);

  useEffect(() => {
    if (user?.isAuthenticated && !pendingMFA) {
      const redirectUri = getPendingRedirectUri();
      if (redirectUri) {
        clearPendingRedirectUri();
        window.location.href = buildRedirectUrl(redirectUri);
      } else {
        navigate('/dashboard', { replace: true });
      }
    } else if (pendingMFA && user) {
      navigate('/mfa/verify', { replace: true });
    }
  }, [user, pendingMFA, navigate]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isBackgroundBlurred, setIsBackgroundBlurred] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isPasswordless, setIsPasswordless] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsBackgroundBlurred(true);
      setIsFormVisible(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const validateEmail = (email: string): string => {
    if (!email) return '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    if (email.length > 254) return 'Email address is too long';
    const [localPart, domain] = email.split('@');
    if (localPart.length > 64 || domain.length > 253) return 'Email address format is invalid';
    return '';
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setIsTyping(newEmail.length > 0);
    if (emailError) setEmailError('');
    if (error) clearError();
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) clearError();
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
      } else {
        if (!password.trim()) {
          setEmailError('Please enter your password');
          return;
        }
        await login(email.trim(), password.trim(), DEFAULT_TENANT_ID);
      }
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && email.trim()) {
      handleSubmit();
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

  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <div className={`${styles.backgroundImage} ${isBackgroundBlurred ? styles.blurred : ''}`} />
      </div>

      <div className={`${styles.content} ${isFormVisible ? styles.visible : ''}`}>
        <div className={`${styles.header} ${isTyping ? styles.blurred : ''}`}>
          <h1 className={styles.title}>
            Sign in to <span className={styles.titleBrand}>IS</span>
          </h1>
          <p className={styles.subtitle}>
            One account for all your apps. Enter your email or sign in with Google.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.emailInput}>
            <div className={`${authFormStyles.inputGroup} ${isFocused ? authFormStyles.focused : ''} ${emailError ? authFormStyles.error : ''}`}>
              <div className={authFormStyles.inputRow}>
                <input
                  type="email"
                  className={authFormStyles.input}
                  placeholder="account email"
                  value={email}
                  onChange={handleEmailChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onKeyPress={handleKeyPress}
                />
              </div>
              {!isPasswordless && (
                <div className={authFormStyles.inputRow}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={authFormStyles.input}
                    placeholder="password"
                    value={password}
                    onChange={handlePasswordChange}
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
              )}
              <div className={authFormStyles.submitRow}>
                <button
                  type="submit"
                  className={authFormStyles.submitButton}
                  disabled={!email.trim() || !!emailError || (!isPasswordless && !password.trim()) || isLoading}
                >
                  {isLoading ? (
                    <span className={authFormStyles.spinner} />
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </div>
            {emailError && (
              <div className={styles.errorMessage}>{emailError}</div>
            )}
          </div>

          <div className={styles.options}>
            <button
              type="button"
              className={styles.linkButton}
              onClick={() => { setIsPasswordless(!isPasswordless); setEmailError(''); clearError(); }}
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

          <div className={`${styles.socialLoginContainer} ${isTyping ? styles.blurred : ''}`}>
            <SocialLoginButtons
              onGoogleSignIn={handleGoogleSignIn}
              onAppleSignIn={handleAppleSignIn}
              onMicrosoftSignIn={handleMicrosoftSignIn}
            />
          </div>
        </form>
      </div>

      <div className={`${styles.bottomContainer} ${isFormVisible ? styles.visible : ''}`}>
        <div className={styles.separator} />
        <div className={styles.footer}>
          <p className={styles.footerText}>
            Don&apos;t have an account?{' '}
            <button
              type="button"
              className={styles.footerLink}
              onClick={() => navigate('/signup')}
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
