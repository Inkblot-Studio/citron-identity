import React, { useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
  type Variants,
} from 'framer-motion';
import styles from './CitronMascot.module.scss';

export type MascotMood = 'idle' | 'shy' | 'confused' | 'celebrating' | 'curious';

interface CitronMascotProps {
  mood?: MascotMood;
  /** Rendered width in px (height follows the fixed viewBox aspect). */
  size?: number;
  /** Normalized eye-target direction (-1..1), ideally spring-smoothed. */
  pointerX?: MotionValue<number>;
  pointerY?: MotionValue<number>;
  /** Continuous spin (deg) applied to the whole mark. */
  spin?: MotionValue<number>;
  /** Eyes widen slightly — e.g. while hovering the submit button. */
  attentive?: boolean;
  /** Plays the "look around" beat once (used on entrance). */
  introLook?: boolean;
  /** Increment to trigger a one-off wink. */
  winkSignal?: number;
  /** Both eyes shut — e.g. while a hidden password field is focused. */
  eyesClosed?: boolean;
  className?: string;
}

// Official Citron mark geometry (citron-ds brand asset, 100×100 viewBox).
const SMILE_PATH = 'M 12 40 A 38 38 0 0 0 88 40';
const SMILE_WIDTH = 10;

const LEFT_EYE = { x: 31, y: 17, width: 13, height: 34 };
const RIGHT_EYE = { x: 56, y: 17, width: 13, height: 34 };

const EYE_SCALE: Record<MascotMood, number> = {
  idle: 1,
  curious: 1,
  shy: 0.88,
  confused: 0.92,
  celebrating: 0.28,
};

const BODY_VARIANTS: Variants = {
  idle: {
    x: 0,
    y: [0, -2, 0],
    scale: 1,
    transition: { duration: 5.2, repeat: Infinity, ease: 'easeInOut' },
  },
  curious: {
    x: 0,
    y: [0, -2, 0],
    scale: 1,
    transition: { duration: 3.4, repeat: Infinity, ease: 'easeInOut' },
  },
  shy: {
    x: 0,
    y: 1,
    scale: 0.99,
    transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] },
  },
  confused: {
    x: [0, -4, 3, -2, 0],
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: 'easeOut' },
  },
  celebrating: {
    x: 0,
    y: [0, -6, 0],
    scale: [1, 1.03, 1],
    transition: { duration: 0.65, ease: 'easeOut' },
  },
};

export const CitronMascot: React.FC<CitronMascotProps> = ({
  mood = 'idle',
  size = 200,
  pointerX,
  pointerY,
  spin,
  attentive = false,
  introLook = false,
  winkSignal = 0,
  eyesClosed = false,
  className,
}) => {
  const reducedMotion = useReducedMotion();
  const [blinking, setBlinking] = useState(false);
  const [winking, setWinking] = useState(false);
  const blinkTimer = useRef<ReturnType<typeof setTimeout>>();

  const fallback = useMotionValue(0);
  const spinFallback = useMotionValue(0);
  const px = pointerX ?? fallback;
  const py = pointerY ?? fallback;
  const spinValue = spin ?? spinFallback;

  const eyeDx = useTransform(px, (v) => (eyesClosed ? 0 : v * 2.2));
  const eyeDy = useTransform(py, (v) => (eyesClosed ? 0 : v * 1.6));

  useEffect(() => {
    if (reducedMotion || mood === 'celebrating' || eyesClosed) return;
    let cancelled = false;

    const schedule = (delay: number) => {
      blinkTimer.current = setTimeout(() => {
        if (cancelled) return;
        setBlinking(true);
        setTimeout(() => {
          if (cancelled) return;
          setBlinking(false);
        }, 110);
        schedule(3200 + Math.random() * 4800);
      }, delay);
    };

    schedule(1800 + Math.random() * 2600);
    return () => {
      cancelled = true;
      clearTimeout(blinkTimer.current);
    };
  }, [reducedMotion, mood, eyesClosed]);

  useEffect(() => {
    if (!winkSignal || reducedMotion || eyesClosed) return;
    setWinking(true);
    const t = setTimeout(() => setWinking(false), 280);
    return () => clearTimeout(t);
  }, [winkSignal, reducedMotion, eyesClosed]);

  const moodScale = EYE_SCALE[mood] * (attentive && mood === 'idle' ? 1.04 : 1);
  const closedScaleY = 0.05;
  const leftEyeScaleY = eyesClosed || blinking || winking ? closedScaleY : moodScale;
  const rightEyeScaleY = eyesClosed || blinking ? closedScaleY : moodScale;

  return (
    <motion.div
      className={`${styles.mascot} ${className ?? ''}`}
      style={{
        width: size,
        height: size,
        rotate: reducedMotion ? 0 : spinValue,
      }}
      variants={reducedMotion ? undefined : BODY_VARIANTS}
      animate={reducedMotion ? undefined : mood}
      initial={false}
      data-eyes-closed={eyesClosed || undefined}
    >
      <svg viewBox="0 0 100 100" role="img" aria-label="Citron mascot" className={styles.svg}>
        <motion.g style={reducedMotion ? undefined : { x: eyeDx, y: eyeDy }}>
          <motion.g
            animate={
              introLook && !reducedMotion && !eyesClosed ? { x: [0, -3, -3, 3, 3, 0] } : { x: 0 }
            }
            transition={{
              duration: 1.4,
              delay: 0.25,
              times: [0, 0.18, 0.4, 0.58, 0.82, 1],
              ease: 'easeInOut',
            }}
          >
            <motion.rect
              className={styles.eye}
              x={LEFT_EYE.x}
              y={LEFT_EYE.y}
              width={LEFT_EYE.width}
              height={LEFT_EYE.height}
              animate={{ scaleY: leftEyeScaleY }}
              transition={{
                duration: eyesClosed || blinking || winking ? 0.14 : 0.22,
                ease: 'easeOut',
              }}
            />
            <motion.rect
              className={styles.eye}
              x={RIGHT_EYE.x}
              y={RIGHT_EYE.y}
              width={RIGHT_EYE.width}
              height={RIGHT_EYE.height}
              animate={{ scaleY: rightEyeScaleY }}
              transition={{
                duration: eyesClosed || blinking ? 0.14 : 0.22,
                ease: 'easeOut',
              }}
            />
          </motion.g>
        </motion.g>

        <path className={styles.smile} d={SMILE_PATH} strokeWidth={SMILE_WIDTH} />
      </svg>
    </motion.div>
  );
};
