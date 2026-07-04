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
  className?: string;
}

// The exact Citron smile — a thick semicircular arc. This shape never changes,
// so the mark always reads as the provided logo.
const SMILE_PATH = 'M 9 39 A 56 56 0 0 0 121 39';
const SMILE_WIDTH = 17;

const EYE_SCALE: Record<MascotMood, number> = {
  idle: 1,
  curious: 1,
  shy: 0.62,
  confused: 0.9,
  celebrating: 0.22,
};

// Only position/scale move — the geometry of the mark is preserved.
const BODY_VARIANTS: Variants = {
  idle: {
    x: 0,
    y: [0, -4, 0],
    scale: [1, 1.015, 1],
    transition: { duration: 4.6, repeat: Infinity, ease: 'easeInOut' },
  },
  curious: {
    x: 0,
    y: [0, -3, 0],
    scale: 1,
    transition: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' },
  },
  shy: {
    x: 0,
    y: 2,
    scale: 0.985,
    transition: { duration: 0.5, ease: [0.22, 0.9, 0.3, 1] },
  },
  confused: {
    x: [0, -7, 6, -4, 2, 0],
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
  celebrating: {
    x: 0,
    y: [0, -12, 0, -5, 0],
    scale: [1, 1.06, 1, 1.03, 1],
    transition: { duration: 0.9, ease: 'easeOut' },
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

  // Eyes drift a few units toward the cursor (in the 130×108 viewBox space).
  const eyeDx = useTransform(px, (v) => v * 4.4);
  const eyeDy = useTransform(py, (v) => v * 3);

  useEffect(() => {
    if (reducedMotion || mood === 'celebrating') return;
    let cancelled = false;

    const schedule = (delay: number) => {
      blinkTimer.current = setTimeout(() => {
        if (cancelled) return;
        setBlinking(true);
        setTimeout(() => {
          if (cancelled) return;
          setBlinking(false);
          if (Math.random() < 0.24) {
            setTimeout(() => {
              if (cancelled) return;
              setBlinking(true);
              setTimeout(() => !cancelled && setBlinking(false), 96);
            }, 150);
          }
        }, 118);
        schedule(2400 + Math.random() * 4200);
      }, delay);
    };

    schedule(1100 + Math.random() * 2200);
    return () => {
      cancelled = true;
      clearTimeout(blinkTimer.current);
    };
  }, [reducedMotion, mood]);

  useEffect(() => {
    if (!winkSignal || reducedMotion) return;
    setWinking(true);
    const t = setTimeout(() => setWinking(false), 360);
    return () => clearTimeout(t);
  }, [winkSignal, reducedMotion]);

  const moodScale = EYE_SCALE[mood] * (attentive && mood === 'idle' ? 1.1 : 1);
  const leftEyeScaleY = blinking || winking ? 0.08 : moodScale;
  const rightEyeScaleY = blinking ? 0.08 : moodScale;

  return (
    <motion.div
      className={`${styles.mascot} ${className ?? ''}`}
      style={{
        width: size,
        height: (size * 108) / 130,
        rotate: reducedMotion ? 0 : spinValue,
      }}
      variants={reducedMotion ? undefined : BODY_VARIANTS}
      animate={reducedMotion ? undefined : mood}
      initial={false}
    >
      <svg viewBox="0 0 130 108" role="img" aria-label="Citron mascot" className={styles.svg}>
        <motion.g style={reducedMotion ? undefined : { x: eyeDx, y: eyeDy }}>
          <motion.g
            animate={
              introLook && !reducedMotion ? { x: [0, -5, -5, 5, 5, 0] } : { x: 0 }
            }
            transition={{
              duration: 1.7,
              delay: 0.3,
              times: [0, 0.18, 0.4, 0.58, 0.82, 1],
              ease: 'easeInOut',
            }}
          >
            <motion.rect
              className={styles.eye}
              x="35"
              y="4"
              width="22"
              height="56"
              rx="6.5"
              animate={{ scaleY: leftEyeScaleY }}
              transition={{ duration: blinking || winking ? 0.09 : 0.28, ease: 'easeOut' }}
            />
            <motion.rect
              className={styles.eye}
              x="73"
              y="4"
              width="22"
              height="56"
              rx="6.5"
              animate={{ scaleY: rightEyeScaleY }}
              transition={{ duration: blinking ? 0.09 : 0.28, ease: 'easeOut' }}
            />
          </motion.g>
        </motion.g>

        <path
          className={styles.smile}
          d={SMILE_PATH}
          strokeWidth={SMILE_WIDTH}
        />
      </svg>
    </motion.div>
  );
};
