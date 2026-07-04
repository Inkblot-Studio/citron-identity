import React from 'react';
import clsx from 'clsx';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import styles from './ShimmerButton.module.scss';

interface ShimmerButtonProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'
  > {
  loading?: boolean;
  /** Show the trailing arrow that nudges right on hover. */
  showArrow?: boolean;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
}

export const ShimmerButton: React.FC<ShimmerButtonProps> = ({
  loading = false,
  showArrow = true,
  children,
  className,
  disabled,
  onHoverStart,
  onHoverEnd,
  ...rest
}) => {
  const reducedMotion = useReducedMotion();

  return (
    <motion.button
      {...rest}
      disabled={disabled || loading}
      className={clsx(styles.button, loading && styles.loading, className)}
      whileHover={reducedMotion || disabled ? undefined : { y: -2, scale: 1.015 }}
      whileTap={reducedMotion || disabled ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 420, damping: 22 }}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
    >
      <span className={styles.sheen} aria-hidden="true" />
      <span className={styles.content}>
        {loading ? (
          <span className={styles.spinner} aria-label="Loading" />
        ) : (
          <>
            <span className={styles.label}>{children}</span>
            {showArrow && (
              <ArrowRight className={styles.arrow} size={19} strokeWidth={2.4} aria-hidden="true" />
            )}
          </>
        )}
      </span>
    </motion.button>
  );
};
