import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useSpring } from 'framer-motion';
import { CitronMascot, type MascotMood } from './CitronMascot';
import { GridCanvas } from './GridCanvas';
import {
  cardEase,
  clamp,
  HALF_X,
  HALF_Y,
  MASCOT_SIZE,
  pushOutsideKeepOut,
  randomValidPoint,
  type BoundsRect,
} from './authSceneUtils';
import styles from './AuthExperience.module.scss';

interface AuthExperienceShellProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
  mood: MascotMood;
  celebrating?: boolean;
  attentive?: boolean;
  /** Mascot shuts both eyes while a hidden password field is focused. */
  eyesClosed?: boolean;
}

/**
 * Shared auth stage: white grid paper, roaming Citron mascot, and a floating
 * glass card. Used by login, signup, and forgot-password flows.
 */
export const AuthExperienceShell: React.FC<AuthExperienceShellProps> = ({
  children,
  footer,
  mood,
  celebrating = false,
  attentive = false,
  eyesClosed = false,
}) => {
  const reducedMotion = useReducedMotion();
  const [winkSignal, setWinkSignal] = useState(0);
  const [intro, setIntro] = useState(!reducedMotion);
  const cardRef = useRef<HTMLElement>(null);

  const initX =
    typeof window !== 'undefined' ? window.innerWidth * 0.5 - HALF_X : 0;
  const initY =
    typeof window !== 'undefined' ? window.innerHeight * 0.14 - HALF_Y : 0;

  const mx = useSpring(initX, { stiffness: 60, damping: 20, mass: 1 });
  const my = useSpring(initY, { stiffness: 60, damping: 20, mass: 1 });
  const eyeX = useSpring(0, { stiffness: 140, damping: 20 });
  const eyeY = useSpring(0, { stiffness: 140, damping: 20 });
  const spin = useSpring(0, { stiffness: 42, damping: 12, mass: 1 });

  const cursor = useRef({ x: -9999, y: -9999 });
  const bounds = useRef({ w: 1280, h: 800 });
  const spinAcc = useRef(0);
  const wanderTarget = useRef({ x: initX + HALF_X, y: initY + HALF_Y });
  const nextWanderAt = useRef(0);

  const doSpin = useCallback(() => {
    spinAcc.current += 360;
    spin.set(spinAcc.current);
  }, [spin]);

  useEffect(() => {
    if (reducedMotion) return;
    const t = setTimeout(() => setIntro(false), 2200);
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

    const keepOutZone = (): BoundsRect => {
      const { w, h } = bounds.current;
      const card = cardRef.current?.getBoundingClientRect();
      if (!card) {
        return {
          left: w * 0.28,
          top: h * 0.22,
          right: w * 0.72,
          bottom: h * 0.78,
        };
      }
      return {
        left: card.left - 128,
        top: card.top - 128,
        right: card.right + 128,
        bottom: card.bottom + 128,
      };
    };

    const resolveTarget = (rawX: number, rawY: number) => {
      const { w, h } = bounds.current;
      return pushOutsideKeepOut(rawX, rawY, keepOutZone(), w, h);
    };

    nextWanderAt.current = performance.now() + 4800;

    let raf = 0;
    const tick = () => {
      const now = performance.now();
      const { w, h } = bounds.current;
      const cx = mx.get() + HALF_X;
      const cy = my.get() + HALF_Y;
      const { x: curX, y: curY } = cursor.current;
      const hasCursor = curX > -9000;

      if (hasCursor) {
        eyeX.set(clamp((curX - cx) / 260, -1, 1));
        eyeY.set(clamp((curY - cy) / 220, -1, 1));
      } else {
        eyeX.set(0);
        eyeY.set(0);
      }

      let targetX: number;
      let targetY: number;

      if (hasCursor) {
        const raw = resolveTarget(curX, curY - 72);
        targetX = raw.x;
        targetY = raw.y;
      } else if (now > nextWanderAt.current) {
        const next = randomValidPoint(w, h, keepOutZone());
        wanderTarget.current = next;
        targetX = next.x;
        targetY = next.y;
        nextWanderAt.current = now + 5200 + Math.random() * 3600;
      } else {
        targetX = wanderTarget.current.x;
        targetY = wanderTarget.current.y;
      }

      const safe = resolveTarget(targetX, targetY);
      mx.set(safe.x - HALF_X);
      my.set(safe.y - HALF_Y);

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

  useEffect(() => {
    if (reducedMotion || !celebrating) return;
    doSpin();
  }, [celebrating, reducedMotion, doSpin]);

  return (
    <div className={styles.stage}>
      <GridCanvas className={styles.grid} />

      {reducedMotion ? (
        <div className={styles.roamerStatic}>
          <CitronMascot mood={mood} size={MASCOT_SIZE} winkSignal={winkSignal} eyesClosed={eyesClosed} />
        </div>
      ) : (
        <motion.div
          className={styles.roamer}
          style={{ x: mx, y: my }}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, ease: cardEase }}
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
            eyesClosed={eyesClosed}
          />
        </motion.div>
      )}

      <main className={styles.layout}>
        <motion.section
          className={styles.panel}
          ref={cardRef}
          initial={reducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: cardEase, delay: 0.08 }}
        >
          <div className={styles.card}>{children}</div>
          {footer}
        </motion.section>
      </main>
    </div>
  );
};
