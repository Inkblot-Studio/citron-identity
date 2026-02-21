import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './LoadingScreen.module.scss';

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Complete loading and fade out after 1.8 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 800); // Wait for complete fade out animation
    }, 1800);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div 
          className={styles.container}
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            scale: 1.02,
            filter: 'blur(4px)'
          }}
          transition={{ 
            duration: 0.8,
            ease: [0.4, 0, 0.2, 1]
          }}
        >
          <motion.div 
            className={styles.logoContainer}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{
              scale: 0.9,
              opacity: 0
            }}
            transition={{ 
              duration: 0.8, 
              ease: [0.4, 0, 0.2, 1],
              delay: 0.2
            }}
          >
            <motion.div 
              className={styles.logo}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{
                scale: 0.7
              }}
              transition={{ 
                duration: 0.6, 
                ease: [0.4, 0, 0.2, 1],
                delay: 0.3
              }}
            >
              <img src="/src/assets/images/logo_white.svg" alt="IS" />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 