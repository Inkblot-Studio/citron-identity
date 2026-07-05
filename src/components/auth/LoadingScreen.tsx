import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CitronMascot } from '../login/CitronMascot';
import styles from './LoadingScreen.module.scss';

interface LoadingScreenProps {
  onComplete: () => void;
}

/**
 * Boot moment: the mascot surfaces on white paper and hands off to the app.
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const timer = setTimeout(
      () => {
        setIsVisible(false);
        setTimeout(onComplete, reducedMotion ? 100 : 320);
      },
      reducedMotion ? 220 : 900
    );
    return () => clearTimeout(timer);
  }, [onComplete, reducedMotion]);

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          className={styles.container}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.1 : 0.28, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.div
            className={styles.mascotHolder}
            initial={reducedMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <CitronMascot size={72} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
