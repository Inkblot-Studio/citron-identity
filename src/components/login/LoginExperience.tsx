import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useSpring,
} from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, MailCheck } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { DEFAULT_TENANT_ID } from '@/mocks/tenants';
import {
  getRedirectUriFromSearch,
  setPendingRedirectUri,
  getPendingRedirectUri,
  clearPendingRedirectUri,
  buildRedirectUrl,
} from '@/lib/redirect';
import { CitronMascot, type MascotMood } from './CitronMascot';
import { GridCanvas } from './GridCanvas';
import { FloatingInput } from './FloatingInput';
import { ShimmerButton } from './ShimmerButton';
import { SocialButtons } from './SocialButtons';
import styles from './LoginExperience.module.scss';

const cardEase = [0.22, 0.9, 0.3, 1] as const;

const MASCOT_SIZE = 190;
const MASCOT_H = (MASCOT_SIZE * 108) / 130;
const HALF_X = MASCOT_SIZE / 2;
const HALF_Y = MASCOT_H / 2;
// The mascot always stays this far above the login card, so it can never cover
// the central fields.
const CARD_GAP = 30;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export const LoginExperience: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, pendingMFA, login, sendMagicLink, isLoading, error, clearError } =
    useAuthStore();
  const reducedMotion = useReducedMotion();

  // ---------------------------------------------------------------- auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isPasswordless, setIsPasswordless] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // ------------------------------------------------------------- scene state
  const [celebrating, setCelebrating] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [attentive, setAttentive] = useState(false);
  const [winkSignal, setWinkSignal] = useState(0);
  const [intro, setIntro] = useState(!reducedMotion);

  const justLoggedIn = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // --------------------------------------------------------- roaming mascot
  const initX =
    typeof window !== 'undefined' ? window.innerWidth * 0.5 - HALF_X : 0;
  const initY =
    typeof window !== 'undefined' ? window.innerHeight * 0.14 - HALF_Y : 0;

  // Position glides; eyes track quickly; spin turns the whole mark on itself.
  const mx = useSpring(initX, { stiffness: 60, damping: 20, mass: 1 });
  const my = useSpring(initY, { stiffness: 60, damping: 20, mass: 1 });
  const eyeX = useSpring(0, { stiffness: 140, damping: 20 });
  const eyeY = useSpring(0, { stiffness: 140, damping: 20 });
  const spin = useSpring(0, { stiffness: 42, damping: 12, mass: 1 });

  const cursor = useRef({ x: -9999, y: -9999 });
  const bounds = useRef({ w: 1280, h: 800 });
  const spinAcc = useRef(0);

  const doSpin = useCallback(() => {
    spinAcc.current += 360;
    spin.set(spinAcc.current);
  }, [spin]);

  // -------------------------------------------------- existing business logic
  useEffect(() => {
    const redirectUri = getRedirectUriFromSearch(location.search);
    if (redirectUri) setPendingRedirectUri(redirectUri);
  }, [location.search]);

  useEffect(() => {
    if (user?.isAuthenticated && !pendingMFA) {
      const go = () => {
        const redirectUri = getPendingRedirectUri();
        if (redirectUri) {
          clearPendingRedirectUri();
          window.location.href = buildRedirectUrl(redirectUri);
        } else {
          navigate('/dashboard', { replace: true });
        }
      };
      if (justLoggedIn.current && !reducedMotion) {
        setCelebrating(true);
        const t = setTimeout(go, 1100);
        return () => clearTimeout(t);
      }
      go();
    } else if (pendingMFA && user) {
      navigate('/mfa/verify', { replace: true });
    }
  }, [user, pendingMFA, navigate, reducedMotion]);

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

  // ---------------------------------------------------------- entrance beat
  useEffect(() => {
    if (reducedMotion) return;
    const t = setTimeout(() => setIntro(false), 2200);
    return () => clearTimeout(t);
  }, [reducedMotion]);

  // ------------------------------------------------------- idle wink timer
  useEffect(() => {
    if (reducedMotion) return;
    let timer: ReturnType<typeof setTimeout>;
    const arm = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setWinkSignal((n) => n + 1);
        arm();
      }, 12000);
    };
    arm();
    const reset = () => arm();
    window.addEventListener('pointermove', reset, { passive: true });
    window.addEventListener('keydown', reset);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('pointermove', reset);
      window.removeEventListener('keydown', reset);
    };
  }, [reducedMotion]);

  // --------------------------------------------------- movement controller
  // Deliberate, legible motion: the mark glides left/right along a single line
  // ABOVE the card, shadowing the cursor's column, and never covers the form.
  useEffect(() => {
    if (reducedMotion) return;

    const readBounds = () => {
      bounds.current = { w: window.innerWidth, h: window.innerHeight };
    };
    readBounds();

    const onMove = (e: PointerEvent) => {
      cursor.current = { x: e.clientX, y: e.clientY };
    };
    const onLeave = () => {
      cursor.current = { x: -9999, y: -9999 };
    };

    window.addEventListener('resize', readBounds);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave);

    // SAFE = the mark's real visual reach from its own centre, including the
    // extra swing while it spins. Every position keeps this margin from the
    // screen edges and from the card, so it can never clip out or cover it.
    const SAFE = 96;
    const MAX_DRIFT = 220; // keep the drift subtle + minimal around centre

    const track = () => {
      const { w, h } = bounds.current;
      const centerX = w / 2;
      const xMin = SAFE;
      const xMax = Math.max(xMin + 20, w - SAFE);
      const cardTop = cardRef.current
        ? cardRef.current.getBoundingClientRect().top
        : h * 0.5;
      // Lowest the centre may sit and still keep the whole (spinning) mark above
      // the card, clamped so the top can never clip off-screen either.
      const yLine = clamp(cardTop - CARD_GAP - SAFE, SAFE, h * 0.55);
      return { centerX, xMin, xMax, yLine };
    };

    let raf = 0;
    const tick = () => {
      const cx = mx.get() + HALF_X;
      const cy = my.get() + HALF_Y;
      const { x: curX, y: curY } = cursor.current;
      const hasCursor = curX > -9000;

      // Eyes track the cursor everywhere, even when it's down over the card.
      if (hasCursor) {
        eyeX.set(clamp((curX - cx) / 260, -1, 1));
        eyeY.set(clamp((curY - cy) / 220, -1, 1));
      } else {
        eyeX.set(0);
        eyeY.set(0);
      }

      const t = track();
      // Gently shadow the cursor's column within a limited range around centre.
      const drift = hasCursor
        ? clamp((curX - t.centerX) * 0.5, -MAX_DRIFT, MAX_DRIFT)
        : 0;
      const targetX = clamp(t.centerX + drift, t.xMin, t.xMax);
      mx.set(targetX - HALF_X);
      my.set(t.yLine - HALF_Y);

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', readBounds);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
    };
  }, [reducedMotion, mx, my, eyeX, eyeY]);

  // A gentle full turn on its own axis, on a calm cadence.
  useEffect(() => {
    if (reducedMotion) return;
    const id = setInterval(doSpin, 6000);
    return () => clearInterval(id);
  }, [reducedMotion, doSpin]);

  // Playful spins on meaningful moments: hovering the button, celebrating.
  useEffect(() => {
    if (reducedMotion || !attentive) return;
    doSpin();
  }, [attentive, reducedMotion, doSpin]);

  useEffect(() => {
    if (reducedMotion || !celebrating) return;
    doSpin();
  }, [celebrating, reducedMotion, doSpin]);

  // ----------------------------------------------------------------- the mood
  const hasError = Boolean(emailError || error);
  const mood: MascotMood = celebrating
    ? 'celebrating'
    : hasError
      ? 'confused'
      : passwordFocused && !showPassword && password.length > 0
        ? 'shy'
        : 'idle';

  return (
    <div className={styles.stage}>
      <GridCanvas className={styles.grid} />

      {/* roaming mascot — floats above everything, never blocks input */}
      {reducedMotion ? (
        <div className={styles.roamerStatic}>
          <CitronMascot mood={mood} size={MASCOT_SIZE} winkSignal={winkSignal} />
        </div>
      ) : (
        <motion.div
          className={styles.roamer}
          style={{ x: mx, y: my }}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: cardEase }}
        >
          <CitronMascot
            mood={mood}
            size={MASCOT_SIZE}
            pointerX={eyeX}
            pointerY={eyeY}
            spin={spin}
            attentive={attentive}
            introLook={intro}
            winkSignal={winkSignal}
          />
        </motion.div>
      )}

      {/* -------------------------------------------------------------- card */}
      <main className={styles.layout}>
        <motion.section
          className={styles.panel}
          ref={cardRef}
          initial={reducedMotion ? false : { opacity: 0, y: 26, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.85, ease: cardEase, delay: 0.15 }}
        >
          <div className={styles.card}>
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
                    We sent a sign-in link to <strong>{email}</strong>. It expires shortly,
                    so open it soon.
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
          </div>

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
        </motion.section>
      </main>
    </div>
  );
};
