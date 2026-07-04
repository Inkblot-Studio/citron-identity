import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CitronMascot } from '../login/CitronMascot';
import styles from './LoadingScreen.module.scss';

interface LoadingScreenProps {
  onComplete: () => void;
}

/**
 * Boot moment: the mascot surfaces on pure white paper, breathes once, and
 * hands off to the app. The login stage shares the same white background, so
 * the transition reads as one continuous scene.
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const timer = setTimeout(
      () => {
        setIsVisible(false);
        setTimeout(onComplete, reducedMotion ? 120 : 500);
      },
      reducedMotion ? 250 : 1050
    );
    return () => clearTimeout(timer);
  }, [onComplete, reducedMotion]);

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          className={styles.container}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(6px)' }}
          transition={{ duration: reducedMotion ? 0.12 : 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.div
            className={styles.mascotHolder}
            initial={reducedMotion ? false : { opacity: 0, scale: 0.82 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 0.9, 0.3, 1] }}
          >
            <div className={styles.halo} aria-hidden="true" />
            <CitronMascot size={76} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
