import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion, useSpring } from 'framer-motion';
import { CitronMascot, type MascotMood } from './CitronMascot';
import { GridCanvas } from './GridCanvas';
import { cardEase, clamp } from './authSceneUtils';
import { AuthExperienceContext } from './AuthExperienceContext';
import styles from './AuthExperience.module.scss';

interface AuthExperienceShellProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
  mood: MascotMood;
  celebrating?: boolean;
  attentive?: boolean;
  /** Mascot shuts both eyes while a hidden password field is focused. */
  eyesClosed?: boolean;
  /** Mascot blurs its eyes and looks away — "not peeking" at the password. */
  covering?: boolean;
}

/**
 * Shared auth stage: white grid paper and a Citron mascot anchored to the
 * active step header via a portal. Size and spacing follow the card container.
 */
export const AuthExperienceShell: React.FC<AuthExperienceShellProps> = ({
  children,
  footer,
  mood,
  celebrating = false,
  attentive = false,
  eyesClosed = false,
  covering = false,
}) => {
  const reducedMotion = useReducedMotion();
  const [winkSignal, setWinkSignal] = useState(0);
  const [intro, setIntro] = useState(!reducedMotion);
  const [mascotSlot, setMascotSlot] = useState<HTMLElement | null>(null);
  const mascotRef = useRef<HTMLDivElement>(null);

  const registerMascotSlot = useCallback((el: HTMLElement | null) => {
    setMascotSlot(el);
  }, []);

  const eyeX = useSpring(0, { stiffness: 140, damping: 20 });
  const eyeY = useSpring(0, { stiffness: 140, damping: 20 });
  const spin = useSpring(0, { stiffness: 42, damping: 12, mass: 1 });
  const spinAcc = useRef(0);

  useEffect(() => {
    if (reducedMotion) return;
    const t = setTimeout(() => setIntro(false), 1800);
    return () => clearTimeout(t);
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;
    let timer: ReturnType<typeof setTimeout>;
    const arm = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setWinkSignal((n) => n + 1);
        arm();
      }, 22000);
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

  useEffect(() => {
    if (reducedMotion) return;
    const onMove = (e: PointerEvent) => {
      const el = mascotRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const gazeSpan = Math.max(r.width * 4.5, 140);
      eyeX.set(clamp((e.clientX - cx) / gazeSpan, -1, 1));
      eyeY.set(clamp((e.clientY - cy) / gazeSpan, -1, 1));
    };
    const onLeave = () => {
      eyeX.set(0);
      eyeY.set(0);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
    };
  }, [reducedMotion, eyeX, eyeY]);

  useEffect(() => {
    if (reducedMotion || !celebrating) return;
    spinAcc.current += 360;
    spin.set(spinAcc.current);
  }, [celebrating, reducedMotion, spin]);

  const mascotNode = (
    <motion.div
      ref={mascotRef}
      className={styles.mascotHost}
      layoutId={reducedMotion ? undefined : 'auth-mascot'}
      initial={reducedMotion ? false : { opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: cardEase }}
    >
      <CitronMascot
        mood={mood}
        fluid
        pointerX={eyeX}
        pointerY={eyeY}
        spin={spin}
        attentive={attentive}
        introLook={intro}
        winkSignal={winkSignal}
        eyesClosed={eyesClosed}
        covering={covering}
      />
    </motion.div>
  );

  const contextValue = {
    registerMascotSlot,
    mood,
    attentive,
    eyesClosed,
    covering,
    celebrating,
  };

  return (
    <AuthExperienceContext.Provider value={contextValue}>
      <div className={styles.stage}>
        <GridCanvas className={styles.grid} />

        <main className={styles.layout}>
          <motion.section
            className={styles.panel}
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: cardEase, delay: 0.08 }}
          >
            <div className={styles.card}>
              {children}
              {mascotSlot ? createPortal(mascotNode, mascotSlot) : null}
            </div>
            {footer}
          </motion.section>
        </main>
      </div>
    </AuthExperienceContext.Provider>
  );
};
